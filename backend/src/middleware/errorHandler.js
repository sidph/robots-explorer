/**
 * Catch-all error handler. Anything thrown/rejected in a route that calls
 * next(err) ends up here, so individual routes don't need repetitive
 * try/catch boilerplate for unexpected failures.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error("[unhandled error]", err);
  res.status(500).json({
    error: "internal_error",
    message: "Something went wrong on our end. Please try again.",
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "not_found", message: `No route for ${req.method} ${req.originalUrl}` });
}
