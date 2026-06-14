const mongoose = require('mongoose');

const Trip = require('../models/trip.model');
const User = require('../models/user.model');
const Vehicle = require('../models/vehicle.model');
const AppError = require('../utils/app-error');
const { calculateRouteDistance } = require('../utils/distance');

const TRIP_STATUSES = ['pending', 'active', 'completed', 'cancelled'];

function assertValidObjectId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400);
  }
}

function buildTripPopulation(query) {
  return query
    .populate('vehicle', 'vehicleNumber vehicleType model color status lastKnownLocation')
    .populate('driver', 'name email phone avatar role isActive')
    .populate('user', 'name email phone avatar role isActive');
}

function getPagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function buildTripFilters(query) {
  const filter = {};

  if (query.status) {
    if (!TRIP_STATUSES.includes(query.status)) {
      throw new AppError('Invalid trip status filter', 400);
    }
    filter.status = query.status;
  }

  ['driver', 'vehicle', 'user'].forEach((field) => {
    if (query[field]) {
      assertValidObjectId(query[field], `${field} id`);
      filter[field] = query[field];
    }
  });

  if (query.startDate || query.endDate) {
    filter.createdAt = {};

    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      filter.createdAt.$lte = new Date(query.endDate);
    }
  }

  return filter;
}

function buildCoordinate(payload) {
  if (!payload) {
    return undefined;
  }

  const lat = Number(payload.lat);
  const lng = Number(payload.lng);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new AppError('Location lat must be between -90 and 90', 400);
  }

  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new AppError('Location lng must be between -180 and 180', 400);
  }

  return {
    lat,
    lng,
    address: payload.address
  };
}

async function assertRoleUser(userId, role, label) {
  assertValidObjectId(userId, `${label} id`);

  const user = await User.findOne({ _id: userId, role, isActive: true });
  if (!user) {
    throw new AppError(`Active ${label} not found`, 404);
  }

  return user;
}

async function createTrip(payload) {
  const { vehicle: vehicleId, driver: driverId, user: userId } = payload;

  if (!vehicleId || !driverId) {
    throw new AppError('vehicle and driver are required', 400);
  }

  assertValidObjectId(vehicleId, 'vehicle id');

  const [vehicle, driver, user] = await Promise.all([
    Vehicle.findById(vehicleId),
    assertRoleUser(driverId, 'driver', 'driver'),
    userId ? assertRoleUser(userId, 'user', 'user') : Promise.resolve(null)
  ]);

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  if (vehicle.status === 'on_trip') {
    throw new AppError('Vehicle is already on a trip', 409);
  }

  const trip = await Trip.create({
    vehicle: vehicle._id,
    driver: driver._id,
    user: user?._id,
    status: 'pending',
    startLocation: buildCoordinate(payload.startLocation),
    endLocation: buildCoordinate(payload.endLocation)
  });

  vehicle.assignedDriver = driver._id;
  vehicle.driverId = driver._id;
  if (user) {
    vehicle.assignedUser = user._id;
  }
  await vehicle.save();

  return buildTripPopulation(Trip.findById(trip._id));
}

async function getTrips(query) {
  const filter = buildTripFilters(query);
  const { page, limit, skip } = getPagination(query);

  const [trips, total] = await Promise.all([
    buildTripPopulation(Trip.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Trip.countDocuments(filter)
  ]);

  return {
    trips,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

async function getTripById(tripId) {
  assertValidObjectId(tripId, 'trip id');

  const trip = await buildTripPopulation(Trip.findById(tripId));
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  return trip;
}

async function getTripRoute(tripId) {
  const trip = await getTripById(tripId);

  return {
    tripId: trip._id,
    routePoints: trip.routePoints || []
  };
}

async function getTripSummary(tripId) {
  const trip = await getTripById(tripId);

  return {
    tripId: trip._id,
    status: trip.status,
    distance: trip.distance,
    duration: trip.duration,
    averageSpeed: trip.averageSpeed,
    startedAt: trip.startedAt,
    endedAt: trip.endedAt,
    startLocation: trip.startLocation,
    endLocation: trip.endLocation,
    vehicle: trip.vehicle,
    driver: trip.driver,
    user: trip.user,
    routePointCount: trip.routePoints?.length || 0
  };
}

async function cancelTrip(tripId) {
  const trip = await getTripById(tripId);

  if (trip.status === 'completed') {
    throw new AppError('Completed trips cannot be cancelled', 409);
  }

  if (trip.status === 'cancelled') {
    return trip;
  }

  trip.status = 'cancelled';
  trip.endedAt = trip.endedAt || new Date();
  await trip.save();

  if (trip.vehicle) {
    await Vehicle.findByIdAndUpdate(trip.vehicle._id || trip.vehicle, {
      status: 'active',
      isActive: true
    });
  }

  return getTripById(trip._id);
}

async function startTrip(driverId, payload = {}) {
  assertValidObjectId(driverId, 'driver id');

  let trip;

  if (payload.tripId) {
    assertValidObjectId(payload.tripId, 'trip id');
    trip = await Trip.findOne({ _id: payload.tripId, driver: driverId, status: 'pending' });
  } else {
    trip = await Trip.findOne({ driver: driverId, status: 'pending' }).sort({ createdAt: 1 });
  }

  if (!trip) {
    throw new AppError('No pending trip assigned to this driver', 404);
  }

  const activeTrip = await Trip.findOne({ driver: driverId, status: 'active' });
  if (activeTrip) {
    throw new AppError('Driver already has an active trip', 409);
  }

  trip.status = 'active';
  trip.startedAt = new Date();

  if (payload.startLocation) {
    trip.startLocation = buildCoordinate(payload.startLocation);
  }

  await trip.save();

  await Vehicle.findByIdAndUpdate(trip.vehicle, {
    status: 'on_trip',
    isActive: true
  });

  return getTripById(trip._id);
}

async function stopTrip(tripId, driverId, payload = {}, options = {}) {
  assertValidObjectId(tripId, 'trip id');

  const filter = {
    _id: tripId,
    status: 'active'
  };

  if (!options.isAdmin) {
    filter.driver = driverId;
  }

  const trip = await Trip.findOne(filter);
  if (!trip) {
    throw new AppError('Active trip not found for this driver', 404);
  }

  const endedAt = new Date();
  const routeDistance = calculateRouteDistance(trip.routePoints);
  const durationSeconds = trip.startedAt ? Math.max(Math.round((endedAt - trip.startedAt) / 1000), 0) : 0;
  const averageSpeed = durationSeconds > 0 ? (routeDistance / 1000) / (durationSeconds / 3600) : 0;
  const lastPoint = trip.routePoints[trip.routePoints.length - 1];

  trip.status = 'completed';
  trip.endedAt = endedAt;
  trip.distance = Math.round(routeDistance);
  trip.duration = durationSeconds;
  trip.averageSpeed = Number(averageSpeed.toFixed(2));

  if (payload.endLocation) {
    trip.endLocation = buildCoordinate(payload.endLocation);
  } else if (lastPoint) {
    trip.endLocation = {
      lat: lastPoint.lat,
      lng: lastPoint.lng
    };
  }

  await trip.save();

  await Vehicle.findByIdAndUpdate(trip.vehicle, {
    status: 'active',
    isActive: true
  });

  return getTripById(trip._id);
}

async function getDriverTrips(driverId, query = {}) {
  return getTrips({
    ...query,
    driver: driverId
  });
}

async function getDriverActiveTrip(driverId) {
  const trip = await buildTripPopulation(Trip.findOne({ driver: driverId, status: 'active' }));

  if (!trip) {
    throw new AppError('No active trip found for this driver', 404);
  }

  return trip;
}

async function getUserActiveTrip(userId) {
  const trip = await buildTripPopulation(Trip.findOne({ user: userId, status: 'active' }));

  if (!trip) {
    throw new AppError('No active tracking trip found for this user', 404);
  }

  return trip;
}

async function getUserTrips(userId, query = {}) {
  return getTrips({
    ...query,
    user: userId
  });
}

async function appendRoutePointForActiveTrip(driverId, location) {
  const trip = await Trip.findOne({ driver: driverId, vehicle: location.vehicleId, status: 'active' });

  if (!trip) {
    return null;
  }

  const routePoint = {
    lat: location.latitude,
    lng: location.longitude,
    speed: location.speed || 0,
    heading: location.heading || 0,
    timestamp: location.timestamp ? new Date(location.timestamp) : new Date()
  };

  trip.routePoints.push(routePoint);

  if (!trip.startLocation) {
    trip.startLocation = {
      lat: routePoint.lat,
      lng: routePoint.lng
    };
  }

  await trip.save();
  return trip;
}

module.exports = {
  appendRoutePointForActiveTrip,
  cancelTrip,
  createTrip,
  getDriverActiveTrip,
  getDriverTrips,
  getTripById,
  getTripRoute,
  getTripSummary,
  getTrips,
  getUserActiveTrip,
  getUserTrips,
  startTrip,
  stopTrip
};
