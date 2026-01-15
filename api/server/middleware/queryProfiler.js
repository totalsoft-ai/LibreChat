const { logger } = require('@librechat/data-schemas');

/**
 * Query profiling middleware for development mode
 * Logs slow queries and provides performance insights
 *
 * @param {Object} mongoose - Mongoose instance
 * @param {Object} options - Profiling options
 * @param {number} options.slowQueryThreshold - Threshold in ms for slow query logging (default: 100)
 * @param {boolean} options.logAllQueries - Whether to log all queries (default: false)
 */
function setupQueryProfiler(mongoose, options = {}) {
  const { slowQueryThreshold = 100, logAllQueries = false } = options;

  // Only enable in development mode
  if (process.env.NODE_ENV === 'production') {
    logger.info('[QueryProfiler] Skipping query profiling in production mode');
    return;
  }

  // Enable Mongoose debug mode with custom logger
  mongoose.set('debug', function (collectionName, methodName, ...methodArgs) {
    const startTime = Date.now();

    // Create a readable query representation
    const query = methodArgs[0] || {};
    const options = methodArgs[1] || {};

    // Log the query execution
    const logQuery = (executionTime) => {
      const isSlow = executionTime >= slowQueryThreshold;

      if (logAllQueries || isSlow) {
        const logLevel = isSlow ? 'warn' : 'debug';
        const message = `[QueryProfiler] ${collectionName}.${methodName}`;

        const details = {
          collection: collectionName,
          method: methodName,
          query: JSON.stringify(query),
          options: JSON.stringify(options),
          executionTime: `${executionTime}ms`,
          isSlow,
        };

        if (isSlow) {
          logger.warn(message, details);
          logger.warn(
            `[QueryProfiler] SLOW QUERY DETECTED: Consider adding indexes or optimizing this query`,
          );
        } else {
          logger.debug(message, details);
        }
      }
    };

    // Simulate execution time tracking (approximation)
    // Note: This is a best-effort approach as Mongoose debug doesn't provide execution time
    setTimeout(() => {
      const executionTime = Date.now() - startTime;
      logQuery(executionTime);
    }, 0);
  });

  // Add query execution hooks for more accurate profiling
  mongoose.plugin((schema) => {
    // Pre-hook to record start time
    schema.pre(/^(find|count|update|delete|aggregate)/, function () {
      this._queryStartTime = Date.now();
    });

    // Post-hook to log execution time
    schema.post(/^(find|count|update|delete|aggregate)/, function (result) {
      if (this._queryStartTime) {
        const executionTime = Date.now() - this._queryStartTime;
        const isSlow = executionTime >= slowQueryThreshold;

        if (logAllQueries || isSlow) {
          const modelName = this.model?.modelName || this.constructor?.modelName || 'Unknown';
          const operation = this.op || 'unknown';

          const logData = {
            model: modelName,
            operation: operation,
            executionTime: `${executionTime}ms`,
            query: JSON.stringify(this.getQuery()),
            resultCount: Array.isArray(result) ? result.length : result ? 1 : 0,
          };

          if (isSlow) {
            logger.warn(`[QueryProfiler] SLOW QUERY: ${modelName}.${operation}`, logData);

            // Provide optimization suggestions
            const query = this.getQuery();
            const suggestions = [];

            if (query && Object.keys(query).length > 2) {
              suggestions.push('Consider adding a compound index for this query pattern');
            }

            if (!this._mongooseOptions?.lean) {
              suggestions.push('Use .lean() for read-only operations to improve performance');
            }

            if (this.getOptions()?.limit === undefined && operation.includes('find')) {
              suggestions.push('Consider adding a limit to prevent fetching too many documents');
            }

            if (suggestions.length > 0) {
              logger.warn('[QueryProfiler] Optimization suggestions:', suggestions);
            }
          } else {
            logger.debug(`[QueryProfiler] ${modelName}.${operation}`, logData);
          }
        }
      }
    });
  });

  logger.info('[QueryProfiler] Query profiling enabled', {
    slowQueryThreshold: `${slowQueryThreshold}ms`,
    logAllQueries,
  });
}

module.exports = { setupQueryProfiler };
