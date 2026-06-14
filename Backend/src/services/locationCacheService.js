const { redisClient, isRedisAvailable } = require('../config/redis');

const ACTIVE_VEHICLES_KEY = 'vehicle:active';

function vehicleLocationKey(vehicleId) {
  return `vehicle:location:${vehicleId}`;
}

function safeJsonParse(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

async function runRedisOperation(operation, fallbackValue = null) {
  if (!isRedisAvailable()) {
    return fallbackValue;
  }

  try {
    return await operation();
  } catch (error) {
    console.error('Redis cache operation failed:', error.message);
    return fallbackValue;
  }
}

async function setVehicleLiveLocation(vehicleId, locationData) {
  const key = vehicleLocationKey(vehicleId);
  const payload = {
    ...locationData,
    vehicleId: vehicleId.toString(),
    cachedAt: new Date().toISOString()
  };

  return runRedisOperation(async () => {
    const serializedLocation = JSON.stringify(payload);

    await redisClient
      .multi()
      .set(key, serializedLocation)
      .sAdd(ACTIVE_VEHICLES_KEY, vehicleId.toString())
      .exec();

    return payload;
  }, payload);
}

async function getVehicleLiveLocation(vehicleId) {
  return runRedisOperation(async () => {
    const location = await redisClient.get(vehicleLocationKey(vehicleId));
    return safeJsonParse(location);
  });
}

async function getMultipleVehicleLocations(vehicleIds = []) {
  if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
    return [];
  }

  return runRedisOperation(async () => {
    const keys = vehicleIds.map(vehicleLocationKey);
    const locations = await redisClient.mGet(keys);

    return locations
      .map(safeJsonParse)
      .filter(Boolean);
  }, []);
}

async function removeVehicleLiveLocation(vehicleId) {
  return runRedisOperation(async () => {
    await redisClient
      .multi()
      .del(vehicleLocationKey(vehicleId))
      .sRem(ACTIVE_VEHICLES_KEY, vehicleId.toString())
      .exec();

    return true;
  }, false);
}

async function getActiveVehicleIds() {
  return runRedisOperation(() => redisClient.sMembers(ACTIVE_VEHICLES_KEY), []);
}

module.exports = {
  ACTIVE_VEHICLES_KEY,
  getActiveVehicleIds,
  getMultipleVehicleLocations,
  getVehicleLiveLocation,
  removeVehicleLiveLocation,
  setVehicleLiveLocation,
  vehicleLocationKey
};
