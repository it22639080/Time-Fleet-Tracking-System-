const mongoose = require('mongoose');

const GeoFence = require('../models/geo-fence.model');
const AppError = require('../utils/app-error');
const {
  isPointInsideCircle,
  isPointInsidePolygon
} = require('../utils/geofence');

const vehicleFenceState = new Map();

function assertValidObjectId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400);
  }
}

function validateGeoFencePayload(payload) {
  if (!payload.name) {
    throw new AppError('Geofence name is required', 400);
  }

  if (!['circle', 'polygon'].includes(payload.type)) {
    throw new AppError('Geofence type must be circle or polygon', 400);
  }

  if (payload.type === 'circle') {
    if (!payload.center || payload.center.lat === undefined || payload.center.lng === undefined) {
      throw new AppError('Circle geofence center lat/lng is required', 400);
    }

    if (!payload.radius || Number(payload.radius) <= 0) {
      throw new AppError('Circle geofence radius must be greater than 0', 400);
    }
  }

  if (payload.type === 'polygon' && (!Array.isArray(payload.polygonCoordinates) || payload.polygonCoordinates.length < 3)) {
    throw new AppError('Polygon geofence requires at least 3 coordinates', 400);
  }
}

function buildPayload(payload, userId) {
  const data = {
    name: payload.name,
    type: payload.type,
    center: payload.center,
    radius: payload.radius,
    radiusMeters: payload.radius,
    polygonCoordinates: payload.polygonCoordinates,
    alertOnEnter: payload.alertOnEnter,
    alertOnExit: payload.alertOnExit,
    isActive: payload.isActive,
    createdBy: userId
  };

  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);
  return data;
}

async function createGeoFence(payload, userId) {
  validateGeoFencePayload(payload);
  return GeoFence.create(buildPayload(payload, userId));
}

async function getGeoFences(query = {}) {
  const filter = {};

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }

  if (query.type) {
    filter.type = query.type;
  }

  return GeoFence.find(filter).sort({ createdAt: -1 });
}

async function getGeoFenceById(geoFenceId) {
  assertValidObjectId(geoFenceId, 'geofence id');

  const geoFence = await GeoFence.findById(geoFenceId);
  if (!geoFence) {
    throw new AppError('Geofence not found', 404);
  }

  return geoFence;
}

async function updateGeoFence(geoFenceId, payload) {
  assertValidObjectId(geoFenceId, 'geofence id');

  const existingGeoFence = await getGeoFenceById(geoFenceId);
  const nextPayload = {
    ...existingGeoFence.toObject(),
    ...payload
  };

  validateGeoFencePayload(nextPayload);

  const geoFence = await GeoFence.findByIdAndUpdate(
    geoFenceId,
    buildPayload(nextPayload),
    { new: true, runValidators: true }
  );

  return geoFence;
}

async function deleteGeoFence(geoFenceId) {
  assertValidObjectId(geoFenceId, 'geofence id');

  const geoFence = await GeoFence.findByIdAndUpdate(
    geoFenceId,
    { isActive: false },
    { new: true, runValidators: true }
  );

  if (!geoFence) {
    throw new AppError('Geofence not found', 404);
  }

  return geoFence;
}

function isLocationInsideGeoFence(location, geoFence) {
  const point = {
    lat: location.latitude ?? location.lat,
    lng: location.longitude ?? location.lng
  };

  if (geoFence.type === 'circle') {
    return isPointInsideCircle(point, geoFence.center, geoFence.radius);
  }

  return isPointInsidePolygon(point, geoFence.polygonCoordinates);
}

async function evaluateGeoFenceTransitions(location) {
  const activeGeoFences = await GeoFence.find({ isActive: true });
  const transitions = [];

  activeGeoFences.forEach((geoFence) => {
    const stateKey = `${location.vehicleId}:${geoFence._id}`;
    const wasInside = vehicleFenceState.get(stateKey) || false;
    const isInside = isLocationInsideGeoFence(location, geoFence);

    vehicleFenceState.set(stateKey, isInside);

    if (!wasInside && isInside && geoFence.alertOnEnter) {
      transitions.push({ eventType: 'geofence_enter', geoFence, isInside });
    }

    if (wasInside && !isInside && geoFence.alertOnExit) {
      transitions.push({ eventType: 'geofence_exit', geoFence, isInside });
    }
  });

  return transitions;
}

module.exports = {
  createGeoFence,
  deleteGeoFence,
  evaluateGeoFenceTransitions,
  getGeoFenceById,
  getGeoFences,
  isLocationInsideGeoFence,
  isPointInsideCircle,
  isPointInsidePolygon,
  updateGeoFence
};
