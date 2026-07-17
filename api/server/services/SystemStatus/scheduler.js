const { logger } = require('@librechat/data-schemas');
const { isEnabled } = require('@librechat/api');
const { runAndPersistChecks } = require('./healthChecks');

const DEFAULT_INTERVAL_MINUTES = 5;

function getCheckIntervalMinutes() {
  const parsed = parseInt(process.env.HEALTH_CHECK_INTERVAL_MINUTES, 10);
  return parsed > 0 ? parsed : DEFAULT_INTERVAL_MINUTES;
}

let timer = null;
let isRunning = false;

async function runCycle() {
  if (isRunning) {
    return;
  }
  isRunning = true;
  try {
    await runAndPersistChecks();
  } catch (error) {
    logger.error('[SystemStatus] Health check cycle failed:', error);
  } finally {
    isRunning = false;
  }
}

function startSystemStatusChecks() {
  if (process.env.HEALTH_CHECK_ENABLED !== undefined && !isEnabled(process.env.HEALTH_CHECK_ENABLED)) {
    logger.info('[SystemStatus] Health checks disabled via HEALTH_CHECK_ENABLED');
    return;
  }
  if (timer != null) {
    return;
  }
  const intervalMinutes = getCheckIntervalMinutes();
  runCycle();
  timer = setInterval(runCycle, intervalMinutes * 60 * 1000);
  timer.unref?.();
  logger.info(`[SystemStatus] Health checks running every ${intervalMinutes} minute(s)`);
}

function stopSystemStatusChecks() {
  if (timer != null) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  getCheckIntervalMinutes,
  startSystemStatusChecks,
  stopSystemStatusChecks,
};
