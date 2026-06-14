const authService = require('../services/auth.service');
const asyncHandler = require('../utils/async-handler');

const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);

  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);

  res.status(200).json(result);
});

module.exports = {
  login,
  register
};
