const { Pool } = require('pg');
const { logger } = require('~/config');

const pool = process.env.RAG_DB_CONNECTION_STRING
  ? new Pool({ connectionString: process.env.RAG_DB_CONNECTION_STRING })
  : null;

// The ingestion pipeline inserts structural markers like "--- Text ---", "=== Pagina 1 ===",
// "=== Table: Table 1 ===", or a bare "/" breadcrumb as the first line of a chunk; skip these.
const STRUCTURAL_MARKER = /^[-=]{3,}.*[-=]{3,}$/;
const HAS_READABLE_TEXT = /[a-zA-Z0-9]/;
const MAX_TITLE_LENGTH = 100;

function isNoiseLine(line) {
  return STRUCTURAL_MARKER.test(line) || !HAS_READABLE_TEXT.test(line);
}

const SOURCE_QUERY = `
  SELECT DISTINCT ON (source) source, namespace, text, created_at
  FROM qna.embeddings
  WHERE source ILIKE '%wiki.logo.com.tr%'
     OR source ILIKE '%coda.io%'
     OR source ILIKE '%docs.superhuman.com%'
  ORDER BY source, chunk_index ASC
`;

function classifySource(source) {
  if (/wiki\.logo\.com\.tr/i.test(source)) {
    return 'confluence';
  }
  if (/coda\.io|docs\.superhuman\.com/i.test(source)) {
    return 'coda';
  }
  return null;
}

/** Confluence URLs end with the page title (e.g. .../display/EFS/BCRSF+Proiecte). */
function extractConfluenceTitle(source) {
  try {
    const { pathname } = new URL(source);
    const slug = pathname.split('/').filter(Boolean).pop();
    return slug ? decodeURIComponent(slug.replace(/\+/g, ' ')) : source;
  } catch {
    return source;
  }
}

/** Coda URLs are opaque IDs; used only as a fallback when the Coda API is unavailable. */
function extractCodaTitle(text, namespace) {
  const lines = (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const titleLine = lines.find((line) => !isNoiseLine(line));
  if (!titleLine) {
    return namespace;
  }
  return titleLine.length > MAX_TITLE_LENGTH
    ? `${titleLine.slice(0, MAX_TITLE_LENGTH)}…`
    : titleLine;
}

// e.g. https://coda.io/d/_dxLuI5fjbXk/_suqxn38n -> docId "xLuI5fjbXk", pageKey "_suqxn38n"
function getCodaDocId(source) {
  const match = source.match(/\/d\/_d([^/]+)\//i);
  return match ? match[1] : null;
}

function getCodaPageKey(source) {
  const match = source.match(/\/d\/_d[^/]+\/([^/?#]+)/i);
  return match ? match[1] : null;
}

function flattenCodaPages(items, map) {
  for (const item of items || []) {
    const key = getCodaPageKey(item.browserLink || '');
    if (key && item.name) {
      map.set(key, item.name);
    }
    if (Array.isArray(item.children) && item.children.length > 0) {
      flattenCodaPages(item.children, map);
    }
  }
}

async function fetchCodaDocPageTitles(docId) {
  const map = new Map();
  let url = `https://coda.io/apis/v1/docs/${docId}/pages?limit=100`;

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.CODA_API_TOKEN}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      throw new Error(`Coda API returned ${response.status} for doc ${docId}`);
    }
    const body = await response.json();
    flattenCodaPages(body.items, map);
    url = body.nextPageLink || null;
  }

  return map;
}

const CODA_CACHE_TTL_MS = 30 * 60 * 1000;
const CODA_ERROR_CACHE_TTL_MS = 5 * 60 * 1000;
const codaTitleCache = new Map();

/** Fetches (and caches) the page-name map for a Coda doc; falls back to an empty map on error. */
async function getCodaDocPageTitles(docId) {
  const cached = codaTitleCache.get(docId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.titles;
  }

  try {
    const titles = await fetchCodaDocPageTitles(docId);
    codaTitleCache.set(docId, { titles, expiresAt: Date.now() + CODA_CACHE_TTL_MS });
    return titles;
  } catch (error) {
    logger.error(`[DocumentationService] Failed to fetch Coda page titles for doc ${docId}`, error);
    const titles = new Map();
    codaTitleCache.set(docId, { titles, expiresAt: Date.now() + CODA_ERROR_CACHE_TTL_MS });
    return titles;
  }
}

const CODA_FETCH_CONCURRENCY = 5;

/** Resolves real titles for Coda rows via the Coda API, batched per unique doc. */
async function resolveCodaTitles(codaRows) {
  const docIds = [...new Set(codaRows.map((row) => getCodaDocId(row.source)).filter(Boolean))];
  const titlesByDocId = new Map();

  for (let i = 0; i < docIds.length; i += CODA_FETCH_CONCURRENCY) {
    const batch = docIds.slice(i, i + CODA_FETCH_CONCURRENCY);
    const results = await Promise.all(batch.map((docId) => getCodaDocPageTitles(docId)));
    batch.forEach((docId, index) => titlesByDocId.set(docId, results[index]));
  }

  return codaRows.map((row) => {
    const docId = getCodaDocId(row.source);
    const pageKey = getCodaPageKey(row.source);
    const apiTitle = docId && pageKey ? titlesByDocId.get(docId)?.get(pageKey) : null;
    if (!apiTitle) {
      return {
        title: extractCodaTitle(row.text, row.namespace),
        link: row.source,
        date: row.created_at,
      };
    }
    const title =
      apiTitle.length > MAX_TITLE_LENGTH ? `${apiTitle.slice(0, MAX_TITLE_LENGTH)}…` : apiTitle;
    return { title, link: row.source, date: row.created_at };
  });
}

async function queryDistinctSources() {
  if (!pool) {
    throw new Error('RAG_DB_CONNECTION_STRING is not configured');
  }
  const { rows } = await pool.query(SOURCE_QUERY);
  return rows;
}

function splitByCategory(rows) {
  const confluenceRows = [];
  const codaRows = [];
  for (const row of rows) {
    const category = classifySource(row.source);
    if (category === 'confluence') {
      confluenceRows.push(row);
    } else if (category === 'coda') {
      codaRows.push(row);
    }
  }
  return { confluenceRows, codaRows };
}

/**
 * Fetches distinct Confluence/Coda documents that were ingested into the RAG vector store,
 * grouped by source category. Coda titles use the cheap text heuristic here so the page can
 * render immediately; call getCodaDocumentsWithApiTitles separately to upgrade them in the
 * background via the (much slower) Coda API.
 */
async function getIngestedDocuments() {
  const rows = await queryDistinctSources();
  const { confluenceRows, codaRows } = splitByCategory(rows);

  const confluence = confluenceRows.map((row) => ({
    title: extractConfluenceTitle(row.source),
    link: row.source,
    date: row.created_at,
  }));
  const coda = codaRows.map((row) => ({
    title: extractCodaTitle(row.text, row.namespace),
    link: row.source,
    date: row.created_at,
  }));

  logger.info(
    `[DocumentationService] fetched ${confluence.length} confluence, ${coda.length} coda documents (heuristic titles)`,
  );

  return { confluence, coda };
}

/**
 * Resolves real Coda page titles via the Coda API. Slower than getIngestedDocuments (one API
 * call per unique Coda doc, cached 30 min) — intended to be fetched in the background and used
 * to upgrade the heuristic titles once ready.
 */
async function getCodaDocumentsWithApiTitles() {
  if (!process.env.CODA_API_TOKEN) {
    throw new Error('CODA_API_TOKEN is not configured');
  }

  const rows = await queryDistinctSources();
  const { codaRows } = splitByCategory(rows);
  const coda = await resolveCodaTitles(codaRows);

  logger.info(`[DocumentationService] resolved ${coda.length} coda documents via Coda API`);

  return { coda };
}

module.exports = { getIngestedDocuments, getCodaDocumentsWithApiTitles };
