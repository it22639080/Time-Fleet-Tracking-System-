const { createClient } = require('redis');

const { env } = require('./env');

function buildRedisConfig() {
  if (env.redisUrl) {
    return {
      url: env.redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
      }
    };
  }

  return {
    socket: {
      host: env.redisHost,
      port: env.redisPort,
      reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
    },
    password: env.redisPassword || undefined
  };
}

const redisClient = createClient(buildRedisConfig());

let redisAvailable = false;

redisClient.on('connect', () => {
  console.log('Redis connecting');
});

redisClient.on('ready', () => {
  redisAvailable = true;
  console.log('Redis connected');
});

redisClient.on('error', (error) => {
  redisAvailable = false;
  console.error('Redis error:', error.message);
});

redisClient.on('end', () => {
  redisAvailable = false;
  console.log('Redis disconnected');
});

async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    redisAvailable = false;
    console.error('Redis unavailable. Continuing without live cache:', error.message);
  }
}

async function disconnectRedis() {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}

function isRedisAvailable() {
  return redisAvailable && redisClient.isOpen && redisClient.isReady;
}

module.exports = {
  redisClient,
  connectRedis,
  disconnectRedis,
  isRedisAvailable
};
