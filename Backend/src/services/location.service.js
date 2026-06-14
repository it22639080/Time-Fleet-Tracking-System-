const mongoose = require('mongoose');

const LocationHistory = require('../models/location-history.model');
const LocationPoint = require('../models/location-point.model');
const Vehicle = require('../models/vehicle.model');
const locationCacheService = require('./locationCacheService');
const tripService = require('./trip.service');
const AppError = require('../utils/app-error');

function latestLocationKey(vehicleId) {
  return locationCacheService.vehicleLocationKey(vehicleId);
}

function validateCoordinates(latitude, longitude) {
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  if (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90) {
    throw new AppError('latitude must be a number between -90 and 90', 400);
  }

  if (!Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
    throw new AppError('longitude must be a number between -180 and 180', 400);
  }

  return {
    latitude: parsedLatitude,
    longitude: parsedLongitude
  };
}

function validateLocationMetadata(payload) {
  const speed = payload.speed === undefined ? 0 : Number(payload.speed);
  const heading = payload.heading === undefined ? 0 : Number(payload.heading);
  const accuracy = payload.accuracy === undefined ? undefined : Number(payload.accuracy);

  if (!Number.isFinite(speed) || speed < 0) {
    throw new AppError('speed must be a positive number', 400);
  }

  if (!Number.isFinite(heading) || heading < 0 || heading > 360) {
    throw new AppError('heading must be a number between 0 and 360', 400);
  }

  if (accuracy !== undefined && (!Number.isFinite(accuracy) || accuracy < 0)) {
    throw new AppError('accuracy must be a positive number', 400);
  }

  return {
    speed,
    heading,
    accuracy
  };
}

async function saveDriverLocation(driverId, payload) {
  let { vehicleId } = payload;

  if (vehicleId && !mongoose.Types.ObjectId.isValid(vehicleId)) {
    throw new AppError('Valid vehicleId is required', 400);
  }

  const vehicle = await Vehicle.findOne({
    ...(vehicleId ? { _id: vehicleId } : {}),
    $or: [{ driverId }, { assignedDriver: driverId }],
    isActive: true
  }).sort({ updatedAt: -1 });

  if (!vehicle) {
    throw new AppError('Active vehicle is not assigned to this driver', 403);
  }

  vehicleId = vehicle._id;

  const { latitude, longitude } = validateCoordinates(payload.latitude, payload.longitude);
  const { speed, heading, accuracy } = validateLocationMetadata(payload);
  const timestamp = new Date();

  const location = {
    vehicleId: vehicle._id.toString(),
    driverId: driverId.toString(),
    assignedUserId: vehicle.assignedUser ? vehicle.assignedUser.toString() : null,
    vehicleStatus: vehicle.status,
    latitude,
    longitude,
    speed,
    heading,
    accuracy,
    timestamp: timestamp.toISOString()
  };

  await locationCacheService.setVehicleLiveLocation(vehicle._id, location);

  await LocationHistory.create({
    vehicleId: vehicle._id,
    latitude,
    longitude,
    timestamp
  });

  await Vehicle.findByIdAndUpdate(vehicle._id, {
    lastKnownLocation: {
      lat: latitude,
      lng: longitude,
      speed,
      heading,
      timestamp,
      geo: {
        type: 'Point',
        coordinates: [longitude, latitude]
      }
    }
  });

  const activeTrip = await tripService.appendRoutePointForActiveTrip(driverId, location);

  if (activeTrip) {
    await LocationPoint.create({
      vehicle: vehicle._id,
      trip: activeTrip._id,
      driver: driverId,
      lat: latitude,
      lng: longitude,
      speed,
      heading,
      accuracy,
      timestamp
    });
  }

  return location;
}

module.exports = {
  latestLocationKey,
  saveDriverLocation
};
