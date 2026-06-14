const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const User = require('../models/user.model');
const AppError = require('../utils/app-error');
const asyncHandler = require('../utils/async-handler');
const {
  canAccessTrip,
  canAccessVehicle,
  resolveTrip,
  resolveVehicle
} = require('../utils/access-control');

const protect = asyncHandler(async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token is required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account is inactive', 403);
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AppError('Invalid or expired authentication token', 401);
    }

    throw error;
  }
});

function authorizeRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication is required', 401));
    }

    if (req.user.role === 'admin') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to access this resource', 403));
    }

    return next();
  };
}

function authorizeVehicleAccess(paramName = 'vehicleId') {
  return asyncHandler(async (req, _res, next) => {
    if (!req.user) {
      throw new AppError('Authentication is required', 401);
    }

    const vehicleId = req.params[paramName] || req.body[paramName] || req.query[paramName];
    const vehicle = await resolveVehicle(vehicleId);

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    const allowed = await canAccessVehicle(req.user, vehicle);
    if (!allowed) {
      throw new AppError('You are not assigned to this vehicle', 403);
    }

    req.vehicle = vehicle;
    return next();
  });
}

function authorizeTripAccess(paramName = 'tripId') {
  return asyncHandler(async (req, _res, next) => {
    if (!req.user) {
      throw new AppError('Authentication is required', 401);
    }

    const tripId = req.params[paramName] || req.body[paramName] || req.query[paramName];
    const trip = await resolveTrip(tripId);

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    const allowed = await canAccessTrip(req.user, trip);
    if (!allowed) {
      throw new AppError('You are not assigned to this trip', 403);
    }

    req.trip = trip;
    return next();
  });
}

module.exports = {
  authorizeTripAccess,
  authorizeVehicleAccess,
  authorizeRoles,
  protect
};
