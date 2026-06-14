const locationService = require('../services/location.service');
const { SOCKET_EVENTS } = require('./socket-events');
const { ADMIN_DASHBOARD_ROOM, driverRoom, vehicleTrackingRoom } = require('./socket-rooms');

function registerDriverSocket(io, socket) {
  if (socket.user.role !== 'driver') {
    return;
  }

  const driverId = socket.user._id.toString();
  socket.join(driverRoom(driverId));

  const connectedPayload = {
    driverId,
    socketId: socket.id,
    connectedAt: new Date().toISOString()
  };

  socket.emit(SOCKET_EVENTS.DRIVER_CONNECT, connectedPayload);
  io.to(ADMIN_DASHBOARD_ROOM).emit(SOCKET_EVENTS.DRIVER_CONNECT, connectedPayload);

  socket.on(SOCKET_EVENTS.DRIVER_LOCATION_UPDATE, async (payload, ack) => {
    try {
      const location = await locationService.saveDriverLocation(socket.user._id, payload || {});

      io.to(ADMIN_DASHBOARD_ROOM).emit(SOCKET_EVENTS.DRIVER_LOCATION_UPDATE, location);
      io.to(vehicleTrackingRoom(location.vehicleId)).emit(SOCKET_EVENTS.DRIVER_LOCATION_UPDATE, location);

      if (typeof ack === 'function') {
        ack({ success: true, location });
      }
    } catch (error) {
      const message = error.message || 'Unable to update driver location';

      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, { message });
      if (typeof ack === 'function') {
        ack({ success: false, message });
      }
    }
  });

  socket.on('disconnect', (reason) => {
    const disconnectedPayload = {
      driverId,
      socketId: socket.id,
      reason,
      disconnectedAt: new Date().toISOString()
    };

    io.to(ADMIN_DASHBOARD_ROOM).emit(SOCKET_EVENTS.DRIVER_DISCONNECT, disconnectedPayload);
  });
}

module.exports = { registerDriverSocket };
