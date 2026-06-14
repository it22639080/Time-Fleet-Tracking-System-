const mongoose = require('mongoose');

const User = require('../models/user.model');
const Vehicle = require('../models/vehicle.model');
const { sanitizeUser } = require('./auth.service');
const AppError = require('../utils/app-error');

function assertValidObjectId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400);
  }
}

async function findDriverById(driverId) {
  assertValidObjectId(driverId, 'driver id');

  const driver = await User.findOne({ _id: driverId, role: 'driver' });
  if (!driver) {
    throw new AppError('Driver not found', 404);
  }

  return driver;
}

async function attachDriverVehicle(driver) {
  const vehicle = await Vehicle.findOne({ driverId: driver._id }).sort({ updatedAt: -1 });

  return {
    ...sanitizeUser(driver),
    vehicle
  };
}

async function getAllDrivers() {
  const drivers = await User.find({ role: 'driver' }).sort({ createdAt: -1 });

  return Promise.all(drivers.map(attachDriverVehicle));
}

async function getDriverProfile(driverId) {
  const driver = await findDriverById(driverId);

  return attachDriverVehicle(driver);
}

async function updateDriverProfile(driverId, payload) {
  await findDriverById(driverId);

  const allowedUpdates = {};
  if (payload.name !== undefined) {
    allowedUpdates.name = payload.name;
  }
  if (payload.email !== undefined) {
    allowedUpdates.email = payload.email;
  }

  if (Object.keys(allowedUpdates).length === 0) {
    throw new AppError('No valid driver profile fields provided', 400);
  }

  const driver = await User.findOneAndUpdate(
    { _id: driverId, role: 'driver' },
    allowedUpdates,
    {
      new: true,
      runValidators: true
    }
  );

  return attachDriverVehicle(driver);
}

async function assignVehicleToDriver(driverId, payload) {
  const driver = await findDriverById(driverId);
  const { vehicleId, vehicleNumber, vehicleType } = payload;

  let vehicle;

  if (vehicleId) {
    assertValidObjectId(vehicleId, 'vehicle id');
    vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    vehicle.driverId = driver._id;
    await vehicle.save();
  } else {
    if (!vehicleNumber || !vehicleType) {
      throw new AppError('vehicleId or vehicleNumber and vehicleType are required', 400);
    }

    const normalizedVehicleNumber = vehicleNumber.trim().toUpperCase();

    vehicle = await Vehicle.findOneAndUpdate(
      { vehicleNumber: normalizedVehicleNumber },
      {
        driverId: driver._id,
        vehicleNumber: normalizedVehicleNumber,
        vehicleType,
        isActive: true
      },
      {
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        upsert: true
      }
    );
  }

  return vehicle;
}

async function setDriverActiveStatus(driverId, isActive) {
  if (typeof isActive !== 'boolean') {
    throw new AppError('isActive must be a boolean', 400);
  }

  await findDriverById(driverId);

  const driver = await User.findOneAndUpdate(
    { _id: driverId, role: 'driver' },
    { isActive },
    {
      new: true,
      runValidators: true
    }
  );

  return attachDriverVehicle(driver);
}

module.exports = {
  assignVehicleToDriver,
  getAllDrivers,
  getDriverProfile,
  setDriverActiveStatus,
  updateDriverProfile
};
