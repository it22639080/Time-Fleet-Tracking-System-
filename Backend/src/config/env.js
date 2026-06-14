const dotenv = require('dotenv');

dotenv.config();

function parseCorsOrigins(value) {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet_tracking',
  redisUrl: process.env.REDIS_URL || '',
  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: Number(process.env.REDIS_PORT) || 6379,
  redisPassword: process.env.REDIS_PASSWORD || '',
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173'),
  jwtSecret: process.env.JWT_SECRET || 'replace_with_a_strong_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geoFenceCenterLat: Number(process.env.GEOFENCE_CENTER_LAT),
  geoFenceCenterLng: Number(process.env.GEOFENCE_CENTER_LNG),
  geoFenceRadiusMeters: Number(process.env.GEOFENCE_RADIUS_METERS) || 0
};

module.exports = { env };
