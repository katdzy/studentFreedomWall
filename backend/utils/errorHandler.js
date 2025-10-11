// Centralized error handling utilities

/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Standard error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} data - Optional additional data
 */
const sendError = (res, statusCode, message, data = null) => {
  const response = { message };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Handle MongoDB validation errors
 * @param {Error} error - Mongoose validation error
 * @returns {string} - Formatted error message
 */
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => err.message);
  return errors.join(', ');
};

/**
 * Handle MongoDB duplicate key errors
 * @param {Error} error - MongoDB duplicate key error
 * @returns {string} - Formatted error message
 */
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  return `${field} already exists`;
};

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return sendError(res, 400, handleValidationError(err));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return sendError(res, 400, handleDuplicateKeyError(err));
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired');
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    return sendError(res, 400, `File upload error: ${err.message}`);
  }

  // Default error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  
  sendError(res, statusCode, message, 
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

module.exports = {
  asyncHandler,
  sendError,
  errorHandler
};

