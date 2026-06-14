const mongoose = require('mongoose');

const LocationHistory = require('../models/location-history.model');
const Vehicle = require('../models/vehicle.model');
const locationCacheService = require('./locationCacheService');
const AppError = require('../utils/app-error');

function assertValidVehicleId(vehicleId) {
  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    throw new AppError('Valid vehicleId is required', 400);
  }
}

async function assertVehicleExists(vehicleId) {
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  return vehicle;
}

async function getLiveVehicleLocation(vehicleId) {
  assertValidVehicleId(vehicleId);
  await assertVehicleExists(vehicleId);

  const location = await locationCacheService.getVehicleLiveLocation(vehicleId);

  if (!location) {
    throw new AppError('Live location is not available for this vehicle', 404);
  }

  return location;
}

async function getVehicleRouteHistory(vehicleId, query = {}) {
  assertValidVehicleId(vehicleId);
  await assertVehicleExists(vehicleId);

  const filter = {
    vehicleId
  };

  if (query.startDate || query.endDate) {
    filter.timestamp = {};

    if (query.startDate) {
      filter.timestamp.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      filter.timestamp.$lte = new Date(query.endDate);
    }
  }

  const limit = Math.min(Number(query.limit) || 1000, 5000);

  return LocationHistory.find(filter)
    .sort({ timestamp: 1 })
    .limit(limit)
    .lean();
}

module.exports = {
  getLiveVehicleLocation,
  getVehicleRouteHistory
};
