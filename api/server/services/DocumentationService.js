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
  SELECT DISTINCT ON (source) source, namespace, text
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
      return { title: extractCodaTitle(row.text, row.namespace), link: row.source };
    }
    const title =
      apiTitle.length > MAX_TITLE_LENGTH ? `${apiTitle.slice(0, MAX_TITLE_LENGTH)}…` : apiTitle;
    return { title, link: row.source };
  });
}

/**
 * Fetches distinct Confluence/Coda documents that were ingested into the RAG vector store,
 * grouped by source category. Coda titles are resolved via the Coda API when CODA_API_TOKEN
 * is configured, falling back to a best-effort heuristic over the ingested text otherwise.
 */
async function getIngestedDocuments() {
  if (!pool) {
    throw new Error('RAG_DB_CONNECTION_STRING is not configured');
  }

  const { rows } = await pool.query(SOURCE_QUERY);

  const confluence = [];
  const codaRows = [];

  for (const row of rows) {
    const category = classifySource(row.source);
    if (category === 'confluence') {
      confluence.push({ title: extractConfluenceTitle(row.source), link: row.source });
    } else if (category === 'coda') {
      codaRows.push(row);
    }
  }

  const coda = process.env.CODA_API_TOKEN
    ? await resolveCodaTitles(codaRows)
    : codaRows.map((row) => ({
        title: extractCodaTitle(row.text, row.namespace),
        link: row.source,
      }));

  confluence.sort((a, b) => a.title.localeCompare(b.title));
  coda.sort((a, b) => a.title.localeCompare(b.title));

  logger.info(
    `[DocumentationService] fetched ${confluence.length} confluence, ${coda.length} coda documents`,
  );

  return { confluence, coda };
}

module.exports = { getIngestedDocuments };
