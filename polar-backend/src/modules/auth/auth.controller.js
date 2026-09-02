const service = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await service.login({ email, password });
  return apiResponse.success(res, result, 'Login successful');
});

const register = asyncHandler(async (req, res) => {
  const { email, password, name, role } = req.body;
  const result = await service.register({ email, password, name, role });
  return apiResponse.success(res, result, result.message || 'Registration successful', 201);
});

module.exports = {
  login,
  register
};
