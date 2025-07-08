/**
 * Response Helper Functions
 * Standardized API responses for WebMaster Pro Backend
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @param {*} errors - Detailed errors
 */
const error = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && errors && errors.stack) {
    response.stack = errors.stack;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items
 * @param {String} message - Success message
 */
const paginated = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const response = {
    success: true,
    message,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNext,
      hasPrev,
      nextPage: hasNext ? page + 1 : null,
      prevPage: hasPrev ? page - 1 : null
    },
    timestamp: new Date().toISOString()
  };

  return res.status(200).json(response);
};

/**
 * Created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {String} message - Success message
 */
const created = (res, data, message = 'Resource created successfully') => {
  return success(res, data, message, 201);
};

/**
 * Not Found response (404)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const notFound = (res, message = 'Resource not found') => {
  return error(res, message, 404);
};

/**
 * Unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const unauthorized = (res, message = 'Unauthorized access') => {
  return error(res, message, 401);
};

/**
 * Forbidden response (403)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const forbidden = (res, message = 'Access forbidden') => {
  return error(res, message, 403);
};

/**
 * Bad Request response (400)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {*} errors - Validation errors
 */
const badRequest = (res, message = 'Bad request', errors = null) => {
  return error(res, message, 400, errors);
};

/**
 * Validation Error response (422)
 * @param {Object} res - Express response object
 * @param {*} errors - Validation errors
 * @param {String} message - Error message
 */
const validationError = (res, errors, message = 'Validation failed') => {
  return error(res, message, 422, errors);
};

/**
 * Too Many Requests response (429)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const tooManyRequests = (res, message = 'Too many requests') => {
  return error(res, message, 429);
};

/**
 * Service Unavailable response (503)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const serviceUnavailable = (res, message = 'Service temporarily unavailable') => {
  return error(res, message, 503);
};

module.exports = {
  success,
  error,
  paginated,
  created,
  notFound,
  unauthorized,
  forbidden,
  badRequest,
  validationError,
  tooManyRequests,
  serviceUnavailable
};
