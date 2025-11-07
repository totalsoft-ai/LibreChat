const { logger } = require('@librechat/data-schemas');

/**
 * WeakMap to track timers associated with objects for automatic cleanup.
 * When the object is garbage collected, the timer reference is also released.
 * @type {WeakMap<Object, Set<NodeJS.Timeout>>}
 */
const timerRegistry = new WeakMap();

/**
 * Global timer tracking for debugging purposes (development mode only)
 * @type {Map<number, { type: string; createdAt: number; stack?: string }>}
 */
const globalTimerTracking = process.env.NODE_ENV === 'development' ? new Map() : null;

let timerId = 0;

/**
 * Creates a managed setTimeout that automatically tracks and can be cleaned up.
 * The timer is associated with a context object and will be cleared when:
 * 1. The timer executes
 * 2. clearManagedTimer is called
 * 3. clearAllTimers is called for the context
 * 4. The context object is garbage collected
 *
 * @param {Object} context - The context object to associate the timer with
 * @param {Function} callback - The function to execute after the delay
 * @param {number} delay - The delay in milliseconds
 * @returns {NodeJS.Timeout} The timer ID
 *
 * @example
 * const client = { id: 'user123' };
 * const timer = createManagedTimeout(client, () => {
 *   console.log('Delayed execution');
 * }, 5000);
 */
function createManagedTimeout(context, callback, delay) {
  if (!context || typeof context !== 'object') {
    logger.warn('[memoryManagement] createManagedTimeout called without valid context');
    return setTimeout(callback, delay);
  }

  const wrappedCallback = () => {
    try {
      callback();
    } finally {
      // Remove timer from registry after execution
      unregisterTimer(context, timer);
    }
  };

  const timer = setTimeout(wrappedCallback, delay);
  registerTimer(context, timer);

  return timer;
}

/**
 * Creates a managed setInterval that automatically tracks and can be cleaned up.
 * The interval is associated with a context object and will be cleared when:
 * 1. clearManagedInterval is called
 * 2. clearAllTimers is called for the context
 * 3. The context object is garbage collected
 *
 * @param {Object} context - The context object to associate the interval with
 * @param {Function} callback - The function to execute at each interval
 * @param {number} delay - The interval delay in milliseconds
 * @returns {NodeJS.Timeout} The interval ID
 *
 * @example
 * const service = { name: 'myService' };
 * const interval = createManagedInterval(service, () => {
 *   console.log('Periodic execution');
 * }, 1000);
 */
function createManagedInterval(context, callback, delay) {
  if (!context || typeof context !== 'object') {
    logger.warn('[memoryManagement] createManagedInterval called without valid context');
    return setInterval(callback, delay);
  }

  const interval = setInterval(callback, delay);
  registerTimer(context, interval);

  return interval;
}

/**
 * Registers a timer with a context object for tracking.
 * @private
 * @param {Object} context - The context object
 * @param {NodeJS.Timeout} timer - The timer to register
 */
function registerTimer(context, timer) {
  if (!timerRegistry.has(context)) {
    timerRegistry.set(context, new Set());
  }

  timerRegistry.get(context).add(timer);

  // Track in global registry for debugging
  if (globalTimerTracking) {
    const id = ++timerId;
    globalTimerTracking.set(id, {
      type: timer._onTimeout ? 'timeout' : 'interval',
      createdAt: Date.now(),
      stack: new Error().stack,
    });
  }
}

/**
 * Unregisters a timer from a context object.
 * @private
 * @param {Object} context - The context object
 * @param {NodeJS.Timeout} timer - The timer to unregister
 */
function unregisterTimer(context, timer) {
  const timers = timerRegistry.get(context);
  if (timers) {
    timers.delete(timer);
    if (timers.size === 0) {
      timerRegistry.delete(context);
    }
  }
}

/**
 * Clears a managed timeout and removes it from the registry.
 *
 * @param {Object} context - The context object the timer was associated with
 * @param {NodeJS.Timeout} timer - The timer to clear
 *
 * @example
 * clearManagedTimer(client, timer);
 */
function clearManagedTimer(context, timer) {
  if (!timer) {
    return;
  }

  clearTimeout(timer);
  unregisterTimer(context, timer);
}

/**
 * Clears a managed interval and removes it from the registry.
 *
 * @param {Object} context - The context object the interval was associated with
 * @param {NodeJS.Timeout} interval - The interval to clear
 *
 * @example
 * clearManagedInterval(service, interval);
 */
function clearManagedInterval(context, interval) {
  if (!interval) {
    return;
  }

  clearInterval(interval);
  unregisterTimer(context, interval);
}

/**
 * Clears all timers (timeouts and intervals) associated with a context object.
 * This should be called in cleanup/dispose methods.
 *
 * @param {Object} context - The context object to clear all timers for
 *
 * @example
 * // In a dispose/cleanup method:
 * clearAllTimers(this);
 */
function clearAllTimers(context) {
  const timers = timerRegistry.get(context);
  if (!timers) {
    return;
  }

  for (const timer of timers) {
    try {
      clearTimeout(timer); // Works for both setTimeout and setInterval
    } catch (error) {
      logger.debug('[memoryManagement] Error clearing timer:', error);
    }
  }

  timerRegistry.delete(context);
}

/**
 * Gets the count of active timers for a context (debugging).
 *
 * @param {Object} context - The context object
 * @returns {number} The number of active timers
 */
function getTimerCount(context) {
  const timers = timerRegistry.get(context);
  return timers ? timers.size : 0;
}

/**
 * Gets debugging information about all active timers (development only).
 *
 * @returns {Object|null} Timer tracking info or null if not in development mode
 */
function getTimerDebugInfo() {
  if (!globalTimerTracking) {
    return null;
  }

  const now = Date.now();
  const timers = [];

  for (const [id, info] of globalTimerTracking.entries()) {
    timers.push({
      id,
      type: info.type,
      age: now - info.createdAt,
      stack: info.stack,
    });
  }

  return {
    totalTimers: timers.length,
    timers: timers.sort((a, b) => b.age - a.age),
  };
}

/**
 * Cleanup utility for EventEmitter instances to prevent memory leaks.
 * Removes all listeners from an EventEmitter.
 *
 * @param {EventEmitter} emitter - The EventEmitter to clean up
 *
 * @example
 * cleanupEventEmitter(myEmitter);
 */
function cleanupEventEmitter(emitter) {
  if (!emitter || typeof emitter.removeAllListeners !== 'function') {
    return;
  }

  try {
    emitter.removeAllListeners();
  } catch (error) {
    logger.debug('[memoryManagement] Error cleaning up EventEmitter:', error);
  }
}

/**
 * Cleanup utility for stream instances.
 * Properly destroys a stream and removes listeners.
 *
 * @param {Stream} stream - The stream to clean up
 *
 * @example
 * cleanupStream(readableStream);
 */
function cleanupStream(stream) {
  if (!stream) {
    return;
  }

  try {
    if (typeof stream.destroy === 'function') {
      stream.destroy();
    }
    if (typeof stream.removeAllListeners === 'function') {
      stream.removeAllListeners();
    }
  } catch (error) {
    logger.debug('[memoryManagement] Error cleaning up stream:', error);
  }
}

/**
 * Cleanup utility for arrays of async iterators/generators.
 * Ensures proper cleanup of async iteration resources.
 *
 * @param {AsyncIterator} iterator - The async iterator to clean up
 *
 * @example
 * await cleanupAsyncIterator(myAsyncGen);
 */
async function cleanupAsyncIterator(iterator) {
  if (!iterator) {
    return;
  }

  try {
    if (typeof iterator.return === 'function') {
      await iterator.return();
    }
    if (typeof iterator.throw === 'function') {
      // Some iterators need explicit termination
      await iterator.throw(new Error('Cleanup'));
    }
  } catch (error) {
    // Expected errors during cleanup
    logger.debug('[memoryManagement] Expected error during async iterator cleanup');
  }
}

module.exports = {
  // Timer management
  createManagedTimeout,
  createManagedInterval,
  clearManagedTimer,
  clearManagedInterval,
  clearAllTimers,
  getTimerCount,
  getTimerDebugInfo,

  // General cleanup utilities
  cleanupEventEmitter,
  cleanupStream,
  cleanupAsyncIterator,
};
