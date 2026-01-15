const winston = require('winston');
const { insertLog } = require('~/server/services/PostgresLogsService');
/**
 * Custom Winston transport pentru PostgreSQL
 */
class PostgresTransport extends winston.Transport {
  constructor(opts) {
    super(opts);
  }
  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    // Inserează în PostgreSQL (async, non-blocking)
    insertLog({
      level: info.level,
      message: info.message,
      stack: info.stack || null,
      metadata: {
        ...info,
        timestamp: undefined, // elimină duplicate
        level: undefined,
        message: undefined,
        stack: undefined,
      },
    })
      .then(() => {
        console.log('✅ [PostgresTransport] Log inserted successfully');
      })
      .catch((err) => {
        console.error('❌[PostgresTransport] Failed to write log:', err.message);
      });
    callback();
  }
}
module.exports = PostgresTransport;
