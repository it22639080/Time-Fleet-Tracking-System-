const mongoose = require('mongoose');

const User = require('../models/user.model');
const Vehicle = require('../models/vehicle.model');
const AppError = require('../utils/app-error');

const VEHICLE_STATUSES = ['active', 'inactive', 'maintenance', 'on_trip'];

function assertValidObjectId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400);
  }
}

function normalizeVehicleNumber(vehicleNumber) {
  return vehicleNumber.trim().toUpperCase();
}

function buildVehiclePayload(payload, currentUserId) {
  const allowedFields = [
    'vehicleNumber',
    'vehicleType',
    'model',
    'color',
    'status',
    'assignedDriver',
    'assignedUser',
    'lastKnownLocation',
    'batteryLevel'
  ];

  const data = {};

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      data[field] = payload[field];
    }
  });

  if (data.vehicleNumber) {
    data.vehicleNumber = normalizeVehicleNumber(data.vehicleNumber);
  }

  if (data.assignedDriver) {
    data.driverId = data.assignedDriver;
  }

  if (data.status) {
    data.isActive = data.status === 'active' || data.status === 'on_trip';
  }

  if (currentUserId) {
    data.createdBy = currentUserId;
  }

  return data;
}

function buildVehicleFilter(query) {
  const filter = {};

  if (query.status) {
    if (!VEHICLE_STATUSES.includes(query.status)) {
      throw new AppError('Invalid vehicle status filter', 400);
    }
    filter.status = query.status;
  }

  if (query.vehicleType) {
    filter.vehicleType = query.vehicleType;
  }

  if (query.search) {
    const search = query.search.trim();
    filter.$or = [
      { vehicleNumber: { $regex: search, $options: 'i' } },
      { vehicleType: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
      { color: { $regex: search, $options: 'i' } }
    ];
  }

  return filter;
}

function getPagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function populateVehicle(query) {
  return query
    .populate('assignedDriver', 'name email phone avatar role isActive')
    .populate('assignedUser', 'name email phone avatar role isActive')
    .populate('createdBy', 'name email role');
}

async function createVehicle(payload, adminId) {
  if (!payload.vehicleNumber || !payload.vehicleType) {
    throw new AppError('vehicleNumber and vehicleType are required', 400);
  }

  const data = buildVehiclePayload(payload, adminId);
  const vehicle = await Vehicle.create(data);

  return populateVehicle(Vehicle.findById(vehicle._id));
}

async function getVehicles(query) {
  const filter = buildVehicleFilter(query);
  const { page, limit, skip } = getPagination(query);

  const [vehicles, total] = await Promise.all([
    populateVehicle(Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Vehicle.countDocuments(filter)
  ]);

  return {
    vehicles,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

async function getVehicleById(vehicleId) {
  assertValidObjectId(vehicleId, 'vehicle id');

  const vehicle = await populateVehicle(Vehicle.findById(vehicleId));
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  return vehicle;
}

async function updateVehicle(vehicleId, payload) {
  assertValidObjectId(vehicleId, 'vehicle id');

  const data = buildVehiclePayload(payload);
  delete data.createdBy;

  if (Object.keys(data).length === 0) {
    throw new AppError('No valid vehicle fields provided', 400);
  }

  const vehicle = await populateVehicle(
    Vehicle.findByIdAndUpdate(vehicleId, data, {
      new: true,
      runValidators: true
    })
  );

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  return vehicle;
}

async function deactivateVehicle(vehicleId) {
  assertValidObjectId(vehicleId, 'vehicle id');

  const vehicle = await populateVehicle(
    Vehicle.findByIdAndUpdate(
      vehicleId,
      {
        status: 'inactive',
        isActive: false
      },
      {
        new: true,
        runValidators: true
      }
    )
  );

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  return vehicle;
}

async function assignDriver(vehicleId, driverId) {
  assertValidObjectId(vehicleId, 'vehicle id');
  assertValidObjectId(driverId, 'driver id');

  const driver = await User.findOne({ _id: driverId, role: 'driver', isActive: true });
  if (!driver) {
    throw new AppError('Active driver not found', 404);
  }

  const vehicle = await populateVehicle(
    Vehicle.findByIdAndUpdate(
      vehicleId,
      {
        assignedDriver: driver._id,
        driverId: driver._id
      },
      {
        new: true,
        runValidators: true
      }
    )
  );

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  return vehicle;
}

async function assignUser(vehicleId, userId) {
  assertValidObjectId(vehicleId, 'vehicle id');
  assertValidObjectId(userId, 'user id');

  const user = await User.findOne({ _id: userId, role: 'user', isActive: true });
  if (!user) {
    throw new AppError('Active user not found', 404);
  }

  const vehicle = await populateVehicle(
    Vehicle.findByIdAndUpdate(
      vehicleId,
      {
        assignedUser: user._id
      },
      {
        new: true,
        runValidators: true
      }
    )
  );

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  return vehicle;
}

async function getVehicleForDriver(driverId) {
  const vehicle = await populateVehicle(
    Vehicle.findOne({
      $or: [{ assignedDriver: driverId }, { driverId }],
      status: { $ne: 'inactive' }
    }).sort({ updatedAt: -1 })
  );

  if (!vehicle) {
    throw new AppError('No vehicle assigned to this driver', 404);
  }

  return vehicle;
}

async function getVehicleForUser(userId) {
  const vehicle = await populateVehicle(
    Vehicle.findOne({
      assignedUser: userId,
      status: { $ne: 'inactive' }
    }).sort({ updatedAt: -1 })
  );

  if (!vehicle) {
    throw new AppError('No tracking vehicle assigned to this user', 404);
  }

  return vehicle;
}

module.exports = {
  assignDriver,
  assignUser,
  createVehicle,
  deactivateVehicle,
  getVehicleById,
  getVehicleForDriver,
  getVehicleForUser,
  getVehicles,
  updateVehicle
};
