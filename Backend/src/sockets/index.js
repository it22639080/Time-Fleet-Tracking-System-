const { createSocketServer } = require('../config/socket');
const { registerDriverSocket } = require('./driver.socket');
const { registerLocationSocket } = require('./locationSocket');
const { socketAuthMiddleware } = require('./socket-auth.middleware');
const { registerTrackingSocket } = require('./tracking.socket');

function initializeSocket(httpServer) {
  const io = createSocketServer(httpServer);

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} user:${socket.user._id} role:${socket.user.role}`);

    registerTrackingSocket(io, socket);
    registerDriverSocket(io, socket);
    registerLocationSocket(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
    });
  });

  return io;
}

module.exports = { initializeSocket };
