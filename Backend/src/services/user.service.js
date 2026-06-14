const User = require('../models/user.model');
const AppError = require('../utils/app-error');

const USER_ROLES = ['admin', 'driver', 'user'];

async function getUsers(query = {}) {
  const filter = {};

  if (query.role) {
    if (!USER_ROLES.includes(query.role)) {
      throw new AppError('Invalid user role filter', 400);
    }
    filter.role = query.role;
  }

  if (query.search) {
    const search = query.search.trim();
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100);

  return User.find(filter)
    .select('name email phone avatar role isActive createdAt')
    .sort({ createdAt: -1 })
    .limit(limit);
}

module.exports = { getUsers };
