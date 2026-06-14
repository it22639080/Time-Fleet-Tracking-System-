const { Server } = require('socket.io');

const { env } = require('./env');

function createSocketServer(httpServer) {
  return new Server(httpServer, {
    cors: {
      origin: env.corsOrigins,
      credentials: true
    }
  });
}

module.exports = { createSocketServer };
