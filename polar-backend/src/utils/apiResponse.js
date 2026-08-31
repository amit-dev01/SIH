/**
 * Standardized API response helpers
 */

const success = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
    data
  };

  if (meta !== null && meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const error = (res, message = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = {
  success,
  error
};
