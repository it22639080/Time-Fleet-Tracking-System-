function notFoundHandler(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

function errorHandler(error, _req, res, _next) {
  if (error.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate value already exists',
      fields: Object.keys(error.keyPattern || {})
    });
  }

  const statusCode = error.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  return res.status(statusCode).json({
    message: error.message || 'Internal server error'
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
