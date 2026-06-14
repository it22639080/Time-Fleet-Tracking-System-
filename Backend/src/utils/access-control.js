const Vehicle = require('../models/vehicle.model');
const Trip = require('../models/trip.model');

function idsMatch(left, right) {
  if (!left || !right) {
    return false;
  }

  return left.toString() === right.toString();
}

async function resolveVehicle(vehicleOrId) {
  if (!vehicleOrId) {
    return null;
  }

  if (vehicleOrId.assignedDriver || vehicleOrId.assignedUser || vehicleOrId.driverId) {
    return vehicleOrId;
  }

  return Vehicle.findById(vehicleOrId);
}

async function resolveTrip(tripOrId) {
  if (!tripOrId) {
    return null;
  }

  if (tripOrId.driver || tripOrId.user || tripOrId.driverId || tripOrId.userId) {
    return tripOrId;
  }

  return Trip.findById(tripOrId);
}

async function isDriverAssignedToVehicle(user, vehicleOrId) {
  if (!user) {
    return false;
  }

  if (user.role === 'admin') {
    return true;
  }

  if (user.role !== 'driver') {
    return false;
  }

  const vehicle = await resolveVehicle(vehicleOrId);

  return idsMatch(vehicle?.assignedDriver, user._id) || idsMatch(vehicle?.driverId, user._id);
}

async function isUserAssignedToVehicle(user, vehicleOrId) {
  if (!user) {
    return false;
  }

  if (user.role === 'admin') {
    return true;
  }

  if (user.role !== 'user') {
    return false;
  }

  const vehicle = await resolveVehicle(vehicleOrId);

  return idsMatch(vehicle?.assignedUser, user._id);
}

async function canAccessVehicle(user, vehicleOrId) {
  if (!user) {
    return false;
  }

  if (user.role === 'admin') {
    return true;
  }

  return isDriverAssignedToVehicle(user, vehicleOrId) || isUserAssignedToVehicle(user, vehicleOrId);
}

async function isDriverAssignedToTrip(user, tripOrId) {
  if (!user) {
    return false;
  }

  if (user.role === 'admin') {
    return true;
  }

  if (user.role !== 'driver') {
    return false;
  }

  const trip = await resolveTrip(tripOrId);

  return idsMatch(trip?.driver, user._id) || idsMatch(trip?.driverId, user._id);
}

async function isUserAssignedToTrip(user, tripOrId) {
  if (!user) {
    return false;
  }

  if (user.role === 'admin') {
    return true;
  }

  if (user.role !== 'user') {
    return false;
  }

  const trip = await resolveTrip(tripOrId);

  return idsMatch(trip?.user, user._id) || idsMatch(trip?.userId, user._id);
}

async function canAccessTrip(user, tripOrId) {
  if (!user) {
    return false;
  }

  if (user.role === 'admin') {
    return true;
  }

  return isDriverAssignedToTrip(user, tripOrId) || isUserAssignedToTrip(user, tripOrId);
}

module.exports = {
  canAccessTrip,
  canAccessVehicle,
  isDriverAssignedToTrip,
  isDriverAssignedToVehicle,
  isUserAssignedToTrip,
  isUserAssignedToVehicle,
  resolveTrip,
  resolveVehicle
};
