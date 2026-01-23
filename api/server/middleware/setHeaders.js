function setHeaders(req, res, next) {
  // Use specific origin instead of wildcard to prevent CSRF attacks
  const allowedOrigin = process.env.DOMAIN_CLIENT || 'http://localhost:3080';
  const requestOrigin = req.headers.origin;

  // Only allow requests from the configured origin
  const corsOrigin =
    requestOrigin && requestOrigin === allowedOrigin ? requestOrigin : allowedOrigin;

  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'X-Accel-Buffering': 'no',
  });
  next();
}

module.exports = setHeaders;
