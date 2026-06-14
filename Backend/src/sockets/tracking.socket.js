const mongoose = require('mongoose');

const Vehicle = require('../models/vehicle.model');
const { canAccessVehicle } = require('../utils/access-control');
const { SOCKET_EVENTS } = require('./socket-events');
const { ADMIN_DASHBOARD_ROOM, vehicleTrackingRoom } = require('./socket-rooms');

function registerTrackingSocket(_io, socket) {
  if (socket.user.role === 'admin') {
    socket.join(ADMIN_DASHBOARD_ROOM);
  }

  socket.on(SOCKET_EVENTS.VEHICLE_TRACK, async (payload, ack) => {
    try {
      const vehicleId = payload && payload.vehicleId;

      if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
        throw new Error('Valid vehicleId is required');
      }

      const vehicleExists = await Vehicle.exists({ _id: vehicleId });
      if (!vehicleExists) {
        throw new Error('Vehicle not found');
      }

      const canTrackVehicle = await canAccessVehicle(socket.user, vehicleId);
      if (!canTrackVehicle) {
        throw new Error('You are not assigned to this vehicle');
      }

      socket.join(vehicleTrackingRoom(vehicleId));

      if (typeof ack === 'function') {
        ack({ success: true, vehicleId });
      }
    } catch (error) {
      const message = error.message || 'Unable to track vehicle';

      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, { message });
      if (typeof ack === 'function') {
        ack({ success: false, message });
      }
    }
  });

  socket.on(SOCKET_EVENTS.VEHICLE_UNTRACK, (payload, ack) => {
    const vehicleId = payload && payload.vehicleId;

    if (vehicleId) {
      socket.leave(vehicleTrackingRoom(vehicleId));
    }

    if (typeof ack === 'function') {
      ack({ success: true, vehicleId });
    }
  });
}

module.exports = { registerTrackingSocket };
