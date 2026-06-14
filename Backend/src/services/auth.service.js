const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const User = require('../models/user.model');
const AppError = require('../utils/app-error');

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

async function registerUser(payload) {
  const { name, email, password, role } = payload;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  if (role === 'admin') {
    throw new AppError('Admin users cannot be created from public registration', 403);
  }

  const allowedPublicRoles = ['user', 'driver'];
  const assignedRole = allowedPublicRoles.includes(role) ? role : 'user';

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: assignedRole
  });

  return {
    token: generateToken(user),
    user: sanitizeUser(user)
  };
}

async function loginUser(payload) {
  const { email, password } = payload;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account is inactive', 403);
  }

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  return {
    token: generateToken(user),
    user: sanitizeUser(user)
  };
}

module.exports = {
  generateToken,
  loginUser,
  registerUser,
  sanitizeUser
};
