const config = require('../config');
const apiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message || err);

  if (err.name === 'ZodError') {
    const formattedErrors = Array.isArray(err.errors)
      ? err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      : err.message;
    return apiResponse.error(res, `Validation error: ${formattedErrors}`, 400);
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return apiResponse.error(res, 'File too large', 400);
  }

  if (err.message && err.message.includes('Storage')) {
    return apiResponse.error(res, 'File upload failed', 500);
  }

  const isDev = config.nodeEnv === 'development';
  const defaultMessage = isDev && err.message ? `Internal server error: ${err.message}` : 'Internal server error';

  return apiResponse.error(res, defaultMessage, 500);
};

module.exports = errorHandler;
