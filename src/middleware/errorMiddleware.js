import logger from "../config/logger.js"

// Middleware to handle requests to undefined routes (404 Not Found)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
};

// General Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  logger.error(err.message, err)

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || 'Server Error',
    // this stack trace is only in development modeOnly for security Remove when Aproved
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  })
}

export { notFound, errorHandler }