// Middleware handle requests to undefined routes (404 Not Found)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
};

// General Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack) // Log stack trace to the server console
  const statusCode = err.statusCode || 500;

  // Send the error response as JSON
  res.status(statusCode).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  })
}

export { notFound, errorHandler }