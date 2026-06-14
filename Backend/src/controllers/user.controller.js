const userService = require('../services/user.service');
const asyncHandler = require('../utils/async-handler');

const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers(req.query);

  res.status(200).json({ users });
});

module.exports = { getUsers };
