const http = require('http');

const app = require('./app');
const { env } = require('./config/env');
const { connectMongoDB } = require('./config/database');
const { connectRedis, disconnectRedis } = require('./config/redis');
const { initializeSocket } = require('./sockets');

const server = http.createServer(app);

initializeSocket(server);

async function startServer() {
  await connectMongoDB();
  await connectRedis();

  server.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully.`);

  server.close(async () => {
    await disconnectRedis();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
