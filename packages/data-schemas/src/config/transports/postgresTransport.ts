import Transport from 'winston-transport';
import type { TransportStreamOptions } from 'winston-transport';

interface LogEntry {
  level: string;
  message: string;
  stack?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Custom Winston transport for PostgreSQL logging
 * Imports insertLog dynamically to avoid circular dependencies
 */
class PostgresTransport extends Transport {
  constructor(opts?: TransportStreamOptions) {
    super(opts);
  }

  async log(info: any, callback: () => void): Promise<void> {
    setImmediate(() => {
      this.emit('logged', info);
    });

    try {
      // Dynamic import to avoid circular dependency

      const { insertLog } = require('../../../api/server/services/PostgresLogsService');

      const logEntry: LogEntry = {
        level: info.level,
        message: info.message,
        stack: info.stack || undefined,
        metadata: {
          ...info,
          timestamp: undefined,
          level: undefined,
          message: undefined,
          stack: undefined,
        },
      };

      await insertLog(logEntry);
      console.log('✅ [PostgresTransport] Log inserted successfully');
    } catch (err: any) {
      console.error('❌ [PostgresTransport] Failed to write log:', err?.message);
      console.error('   Stack:', err?.stack);
    }

    callback();
  }
}

export default PostgresTransport;
