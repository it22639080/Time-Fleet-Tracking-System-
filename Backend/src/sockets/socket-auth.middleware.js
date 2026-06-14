const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const User = require('../models/user.model');

function getSocketToken(socket) {
  const authToken = socket.handshake.auth && socket.handshake.auth.token;
  const header = socket.handshake.headers.authorization;

  if (authToken) {
    return authToken;
  }

  if (header && header.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }

  return null;
}

async function socketAuthMiddleware(socket, next) {
  try {
    const token = getSocketToken(socket);

    if (!token) {
      return next(new Error('Authentication token is required'));
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error('User no longer exists'));
    }

    if (!user.isActive) {
      return next(new Error('Your account is inactive'));
    }

    socket.user = user;
    return next();
  } catch (_error) {
    return next(new Error('Invalid or expired authentication token'));
  }
}

module.exports = { socketAuthMiddleware };
