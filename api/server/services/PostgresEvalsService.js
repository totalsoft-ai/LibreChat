const { Pool } = require('pg');

// Restrict certain repos to specific branches only
const REPO_BRANCH_ALLOWLIST = {
  'totalsoft-ai/assistant-with-knowledge': ['tessa', 'tessa-dev'],
};

/**
 * Appends branch allowlist conditions for repos that have restrictions.
 * Mutates conditions and params in place.
 */
const applyBranchAllowlist = (conditions, params, i) => {
  let paramIndex = i;
  for (const [repo, branches] of Object.entries(REPO_BRANCH_ALLOWLIST)) {
    const placeholders = branches.map(() => `$${paramIndex++}`).join(', ');
    conditions.push(`(repo != $${paramIndex++} OR branch IN (${placeholders}))`);
    params.push(...branches, repo);
  }
  return paramIndex;
};

let pool = null;

const initializePool = () => {
  if (pool) return pool;

  const connectionString = process.env.POSTGRES_EVALS_URI;
  if (!connectionString) {
    console.warn('[PostgresEvalsService] POSTGRES_EVALS_URI not configured');
    return null;
  }

  try {
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    pool.on('error', (err) => console.error('[PostgresEvalsService] Pool error', err));
    console.info('[PostgresEvalsService] Connection pool initialized');
    return pool;
  } catch (error) {
    console.error('[PostgresEvalsService] Failed to initialize pool', error);
    return null;
  }
};

const getPool = () => pool || initializePool();

const queryBaselines = async ({
  page = 1,
  pageSize = 20,
  endpoint,
  category,
  agentModel,
  repo,
  branch,
  testName,
  fromDate,
  toDate,
}) => {
  const currentPool = getPool();
  if (!currentPool) throw new Error('PostgreSQL evals connection not available. Set POSTGRES_EVALS_URI.');

  const offset = (page - 1) * pageSize;
  const params = [];
  let i = 1;
  const conditions = [];

  if (endpoint) { conditions.push(`endpoint = $${i++}`); params.push(endpoint); }
  if (category) { conditions.push(`category = $${i++}`); params.push(category); }
  if (agentModel) { conditions.push(`agent_model = $${i++}`); params.push(agentModel); }
  if (repo) { conditions.push(`repo = $${i++}`); params.push(repo); }
  if (branch) { conditions.push(`branch = $${i++}`); params.push(branch); }
  if (testName) { conditions.push(`test_name ILIKE $${i++}`); params.push(`%${testName}%`); }
  if (fromDate) { conditions.push(`timestamp >= $${i++}`); params.push(fromDate); }
  if (toDate) { conditions.push(`timestamp <= $${i++}`); params.push(toDate); }
  i = applyBranchAllowlist(conditions, params, i);

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await currentPool.query(`SELECT COUNT(*) as total FROM baselines ${where}`, params);
  const total = parseInt(countResult.rows[0].total, 10);

  const dataResult = await currentPool.query(
    `SELECT id, repo, branch, commit_sha, pr_number, endpoint, category, score, timestamp, agent_model, test_name
     FROM baselines ${where}
     ORDER BY timestamp DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...params, pageSize, offset],
  );

  return { data: dataResult.rows, total };
};

const getFilterOptions = async () => {
  const currentPool = getPool();
  if (!currentPool) throw new Error('PostgreSQL evals connection not available.');

  const [endpoints, categories, models, repos, branches] = await Promise.all([
    currentPool.query('SELECT DISTINCT endpoint FROM baselines ORDER BY endpoint'),
    currentPool.query('SELECT DISTINCT category FROM baselines ORDER BY category'),
    currentPool.query('SELECT DISTINCT agent_model FROM baselines ORDER BY agent_model'),
    currentPool.query('SELECT DISTINCT repo FROM baselines ORDER BY repo'),
    currentPool.query('SELECT DISTINCT branch FROM baselines ORDER BY branch'),
  ]);

  return {
    endpoints: endpoints.rows.map((r) => r.endpoint).filter(Boolean),
    categories: categories.rows.map((r) => r.category).filter(Boolean),
    agentModels: models.rows.map((r) => r.agent_model).filter(Boolean),
    repos: repos.rows.map((r) => r.repo).filter(Boolean),
    branches: branches.rows.map((r) => r.branch).filter(Boolean),
  };
};

const getModelScores = async ({ endpoint, category } = {}) => {
  const currentPool = getPool();
  if (!currentPool) throw new Error('PostgreSQL evals connection not available.');

  const conditions = [];
  const params = [];
  let i = 1;

  if (endpoint) { conditions.push(`endpoint = $${i++}`); params.push(endpoint); }
  if (category) { conditions.push(`category = $${i++}`); params.push(category); }
  i = applyBranchAllowlist(conditions, params, i);

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await currentPool.query(
    `SELECT
       agent_model,
       ROUND(AVG(score)::numeric, 2) as avg_score,
       COUNT(*) as run_count,
       ROUND((array_agg(score ORDER BY timestamp DESC))[1]::numeric, 2) as latest_score
     FROM baselines
     ${where}
     GROUP BY agent_model
     ORDER BY latest_score DESC`,
    params,
  );

  return result.rows;
};

const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.info('[PostgresEvalsService] Connection pool closed');
  }
};

module.exports = { initializePool, getPool, queryBaselines, getFilterOptions, getModelScores, closePool };
