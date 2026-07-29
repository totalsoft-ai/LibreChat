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

/**
 * Confluence URLs come in two shapes: pretty ones ending with the page title
 * (.../display/EFS/BCRSF+Proiecte) and permalinks with no title in the path at all
 * (.../pages/viewpage.action?pageId=123456), for which the raw slug is useless as a title.
 */
function extractConfluenceTitle(source) {
  try {
    const url = new URL(source);
    const pageId = url.searchParams.get('pageId');
    if (pageId) {
      return `Confluence page ${pageId}`;
    }
    const slug = url.pathname.split('/').filter(Boolean).pop();
    return slug ? decodeURIComponent(slug.replace(/\+/g, ' ')) : source;
  } catch {
    return source;
  }
}

/**
 * Parses a Confluence URL into whatever the API needs to resolve its real title: a direct
 * pageId when present (permalinks), or a spaceKey/urlTitle pair to look up otherwise. The
 * urlTitle is only a snapshot of the title at ingestion time (e.g. diacritics get stripped, and
 * it goes stale if the page is later renamed), so it's used only as a lookup key / fallback.
 */
function parseConfluenceUrl(source) {
  try {
    const url = new URL(source);
    const pageId = url.searchParams.get('pageId');
    if (pageId) {
      return { origin: url.origin, pageId };
    }
    const match = url.pathname.match(/\/display\/([^/]+)\/([^/?#]+)/i);
    if (!match) {
      return null;
    }
    return {
      origin: url.origin,
      spaceKey: match[1],
      urlTitle: decodeURIComponent(match[2].replace(/\+/g, ' ')),
    };
  } catch {
    return null;
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

async function fetchConfluencePageTitleById(origin, pageId) {
  const response = await fetch(`${origin}/rest/api/content/${pageId}`, {
    headers: { Authorization: `Bearer ${process.env.CONFLUENCE_API_TOKEN}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`Confluence API returned ${response.status} for page ${pageId}`);
  }
  const body = await response.json();
  return body.title || null;
}

async function fetchConfluencePageTitleBySpaceAndTitle(origin, spaceKey, title) {
  const url = `${origin}/rest/api/content?${new URLSearchParams({ spaceKey, title, limit: '1' })}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.CONFLUENCE_API_TOKEN}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`Confluence API returned ${response.status} for ${spaceKey}/${title}`);
  }
  const body = await response.json();
  return body.results?.[0]?.title || null;
}

function fetchConfluencePageTitle(parsed) {
  return parsed.pageId
    ? fetchConfluencePageTitleById(parsed.origin, parsed.pageId)
    : fetchConfluencePageTitleBySpaceAndTitle(parsed.origin, parsed.spaceKey, parsed.urlTitle);
}

const CONFLUENCE_CACHE_TTL_MS = 30 * 60 * 1000;
const CONFLUENCE_ERROR_CACHE_TTL_MS = 5 * 60 * 1000;
const confluenceTitleCache = new Map();

/** Fetches (and caches) the current title for a Confluence page; returns null on error or no match. */
async function getConfluencePageTitle(source, parsed) {
  const cached = confluenceTitleCache.get(source);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.title;
  }

  try {
    const title = await fetchConfluencePageTitle(parsed);
    confluenceTitleCache.set(source, { title, expiresAt: Date.now() + CONFLUENCE_CACHE_TTL_MS });
    return title;
  } catch (error) {
    logger.error(`[DocumentationService] Failed to fetch Confluence title for ${source}`, error);
    confluenceTitleCache.set(source, {
      title: null,
      expiresAt: Date.now() + CONFLUENCE_ERROR_CACHE_TTL_MS,
    });
    return null;
  }
}

const CONFLUENCE_FETCH_CONCURRENCY = 5;

/** Resolves real titles for Confluence rows via the Confluence API, falling back to the URL heuristic. */
async function resolveConfluenceTitles(confluenceRows) {
  const results = [];

  for (let i = 0; i < confluenceRows.length; i += CONFLUENCE_FETCH_CONCURRENCY) {
    const batch = confluenceRows.slice(i, i + CONFLUENCE_FETCH_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (row) => {
        const parsed = parseConfluenceUrl(row.source);
        const apiTitle = parsed ? await getConfluencePageTitle(row.source, parsed) : null;
        return {
          title: apiTitle || extractConfluenceTitle(row.source),
          link: row.source,
          date: row.created_at,
        };
      }),
    );
    results.push(...batchResults);
  }

  return results;
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
 * grouped by source category. Both use cheap heuristic titles here so the page can render
 * immediately; call getConfluenceDocumentsWithApiTitles / getCodaDocumentsWithApiTitles
 * separately to upgrade them in the background via the (much slower) real APIs.
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

/**
 * Resolves real Confluence page titles via the Confluence API. Slower than getIngestedDocuments
 * (one API call per Confluence page, cached 30 min) — intended to be fetched in the background
 * and used to upgrade the heuristic titles once ready.
 */
async function getConfluenceDocumentsWithApiTitles() {
  if (!process.env.CONFLUENCE_API_TOKEN) {
    throw new Error('CONFLUENCE_API_TOKEN is not configured');
  }

  const rows = await queryDistinctSources();
  const { confluenceRows } = splitByCategory(rows);
  const confluence = await resolveConfluenceTitles(confluenceRows);

  logger.info(
    `[DocumentationService] resolved ${confluence.length} confluence documents via Confluence API`,
  );

  return { confluence };
}

module.exports = {
  getIngestedDocuments,
  getCodaDocumentsWithApiTitles,
  getConfluenceDocumentsWithApiTitles,
};
