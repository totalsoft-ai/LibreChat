const { Pool } = require('pg');
const { logger } = require('~/config');

const pool = process.env.RAG_DB_CONNECTION_STRING
  ? new Pool({ connectionString: process.env.RAG_DB_CONNECTION_STRING })
  : null;

// The ingestion pipeline inserts structural markers like "--- Text ---", "=== Pagina 1 ===",
// or "=== Table: Table 1 ===" as the first line of a chunk; these aren't real titles.
const STRUCTURAL_MARKER = /^[-=]{3,}.*[-=]{3,}$/;
const MAX_TITLE_LENGTH = 100;

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

/** Coda URLs are opaque IDs with no title, so fall back to the first line of content. */
function extractCodaTitle(text, namespace) {
  const lines = (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const titleLine = lines.find((line) => !STRUCTURAL_MARKER.test(line));
  if (!titleLine) {
    return namespace;
  }
  return titleLine.length > MAX_TITLE_LENGTH
    ? `${titleLine.slice(0, MAX_TITLE_LENGTH)}…`
    : titleLine;
}

/**
 * Fetches distinct Confluence/Coda documents that were ingested into the RAG vector store,
 * grouped by source category.
 */
async function getIngestedDocuments() {
  if (!pool) {
    throw new Error('RAG_DB_CONNECTION_STRING is not configured');
  }

  const { rows } = await pool.query(SOURCE_QUERY);

  const documents = { confluence: [], coda: [] };

  for (const row of rows) {
    const category = classifySource(row.source);
    if (!category) {
      continue;
    }

    const title =
      category === 'confluence'
        ? extractConfluenceTitle(row.source)
        : extractCodaTitle(row.text, row.namespace);

    documents[category].push({ title, link: row.source });
  }

  documents.confluence.sort((a, b) => a.title.localeCompare(b.title));
  documents.coda.sort((a, b) => a.title.localeCompare(b.title));

  logger.info(
    `[DocumentationService] fetched ${documents.confluence.length} confluence, ${documents.coda.length} coda documents`,
  );

  return documents;
}

module.exports = { getIngestedDocuments };
