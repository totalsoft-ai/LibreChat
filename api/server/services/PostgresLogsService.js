const { Pool } = require('pg');

let pool = null;

/**
 * Initialize PostgreSQL connection pool for logs database
 */
const initializePool = () => {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.POSTGRES_LOGS_URI;

  if (!connectionString) {
    console.warn('[PostgresLogsService] POSTGRES_LOGS_URI not configured');
    return null;
  }

  try {
    pool = new Pool({
      connectionString,
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('[PostgresLogsService] Unexpected pool error', err);
    });

    console.info('[PostgresLogsService] PostgreSQL connection pool initialized');
    return pool;
  } catch (error) {
    console.error('[PostgresLogsService] Failed to initialize pool', error);
    return null;
  }
};

/**
 * Create logs table if it doesn't exist
 */
const createLogsTable = async () => {
  const client = await getPool()?.connect();
  if (!client) {
    return false;
  }

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        level VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        stack TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
      CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
    `);

    console.info('[PostgresLogsService] Logs table created/verified');
    return true;
  } catch (error) {
    console.error('[PostgresLogsService] Failed to create logs table', error);
    return false;
  } finally {
    client.release();
  }
};

/**
 * Get the connection pool (initialize if needed)
 */
const getPool = () => {
  if (!pool) {
    return initializePool();
  }
  return pool;
};

/**
 * Query logs from PostgreSQL with pagination and filters
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.pageSize - Number of items per page
 * @param {string} [options.level] - Filter by log level
 * @param {Date} [options.fromDate] - Filter logs from this date
 * @param {Date} [options.toDate] - Filter logs to this date
 * @returns {Promise<{data: Array, total: number}>}
 */
const queryLogs = async ({ page = 1, pageSize = 20, level, fromDate, toDate }) => {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('PostgreSQL connection not available');
  }

  const offset = (page - 1) * pageSize;
  const params = [];
  let paramIndex = 1;

  // Build WHERE clause
  const conditions = [];

  if (level) {
    conditions.push(`level = $${paramIndex}`);
    params.push(level);
    paramIndex++;
  }

  if (fromDate) {
    conditions.push(`timestamp >= $${paramIndex}`);
    params.push(fromDate);
    paramIndex++;
  }

  if (toDate) {
    conditions.push(`timestamp <= $${paramIndex}`);
    params.push(toDate);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Query for total count
  const countQuery = `SELECT COUNT(*) as total FROM logs ${whereClause}`;
  const countResult = await currentPool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].total, 10);

  // Query for paginated data
  const dataQuery = `
    SELECT id, timestamp, level, message, stack, metadata
    FROM logs
    ${whereClause}
    ORDER BY timestamp DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(pageSize, offset);

  const dataResult = await currentPool.query(dataQuery, params);

  return {
    data: dataResult.rows,
    total,
  };
};

/**
 * Insert a log entry into PostgreSQL
 * @param {Object} logEntry - Log entry to insert
 * @param {string} logEntry.level - Log level (error, warn, info, debug)
 * @param {string} logEntry.message - Log message
 * @param {string} [logEntry.stack] - Stack trace (for errors)
 * @param {Object} [logEntry.metadata] - Additional metadata
 * @returns {Promise<Object>} Inserted log entry
 */
const insertLog = async ({ level, message, stack, metadata }) => {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('PostgreSQL connection not available');
  }

  const query = `
    INSERT INTO logs (level, message, stack, metadata)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const result = await currentPool.query(query, [
    level,
    message,
    stack || null,
    metadata ? JSON.stringify(metadata) : null,
  ]);

  return result.rows[0];
};

/**
 * Close the connection pool
 */
const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.info('[PostgresLogsService] Connection pool closed');
  }
};

module.exports = {
  initializePool,
  createLogsTable,
  getPool,
  queryLogs,
  insertLog,
  closePool,
};
