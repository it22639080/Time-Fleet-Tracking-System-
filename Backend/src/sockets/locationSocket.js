const Vehicle = require('../models/vehicle.model');
const alertService = require('../services/alert.service');
const geoFenceService = require('../services/geo-fence.service');
const locationCacheService = require('../services/locationCacheService');
const locationService = require('../services/location.service');
const tripService = require('../services/trip.service');
const { SOCKET_EVENTS } = require('./socket-events');
const {
  ADMIN_DASHBOARD_ROOM,
  driverRoom,
  userRoom,
  vehicleTrackingRoom
} = require('./socket-rooms');

const LOCATION_UPDATE_INTERVAL_MS = 1000;
const lastLocationUpdateByDriver = new Map();

function emitAck(ack, payload) {
  if (typeof ack === 'function') {
    ack(payload);
  }
}

function canAcceptLocationUpdate(driverId) {
  const now = Date.now();
  const lastUpdate = lastLocationUpdateByDriver.get(driverId) || 0;

  if (now - lastUpdate < LOCATION_UPDATE_INTERVAL_MS) {
    return false;
  }

  lastLocationUpdateByDriver.set(driverId, now);
  return true;
}

async function buildFleetSummary() {
  const activeVehicleIds = await locationCacheService.getActiveVehicleIds();

  return {
    activeVehicles: activeVehicleIds.length,
    generatedAt: new Date().toISOString()
  };
}

function emitVehicleStatus(io, location, status) {
  const payload = {
    vehicleId: location.vehicleId,
    driverId: location.driverId,
    status,
    timestamp: new Date().toISOString()
  };

  io.to(ADMIN_DASHBOARD_ROOM).emit(SOCKET_EVENTS.VEHICLE_STATUS, payload);
  io.to(vehicleTrackingRoom(location.vehicleId)).emit(SOCKET_EVENTS.VEHICLE_STATUS, payload);

  if (location.assignedUserId) {
    io.to(userRoom(location.assignedUserId)).emit(SOCKET_EVENTS.ASSIGNED_VEHICLE_STATUS, payload);
  }
}

async function emitFleetSummary(io) {
  const summary = await buildFleetSummary();
  io.to(ADMIN_DASHBOARD_ROOM).emit(SOCKET_EVENTS.FLEET_SUMMARY, summary);
}

async function emitGeoFenceAlerts(io, socket, location) {
  const transitions = await geoFenceService.evaluateGeoFenceTransitions(location);

  await Promise.all(transitions.map(async (transition) => {
    const alert = await alertService.createAlert({
      type: transition.eventType,
      vehicle: location.vehicleId,
      driver: location.driverId,
      message: `${transition.geoFence.name} ${transition.eventType === 'geofence_enter' ? 'entered' : 'exited'}`,
      location: {
        lat: location.latitude,
        lng: location.longitude
      },
      metadata: {
        geofenceId: transition.geoFence._id,
        geofenceName: transition.geoFence.name,
        geofenceType: transition.geoFence.type
      }
    });

    io.to(ADMIN_DASHBOARD_ROOM).emit(SOCKET_EVENTS.ALERT_NEW, alert);
    socket.emit(SOCKET_EVENTS.GEOFENCE_WARNING, alert);

    if (location.assignedUserId) {
      io.to(userRoom(location.assignedUserId)).emit(SOCKET_EVENTS.ALERT_NEW, alert);
    }
  }));
}

function registerRoleJoinHandlers(io, socket) {
  socket.on(SOCKET_EVENTS.ADMIN_JOIN, async (_payload, ack) => {
    if (socket.user.role !== 'admin') {
      emitAck(ack, { success: false, message: 'Only admins can join admin room' });
      return;
    }

    socket.join(ADMIN_DASHBOARD_ROOM);
    await emitFleetSummary(io);
    emitAck(ack, { success: true, room: ADMIN_DASHBOARD_ROOM });
  });

  socket.on(SOCKET_EVENTS.USER_JOIN, (_payload, ack) => {
    if (socket.user.role !== 'user' && socket.user.role !== 'admin') {
      emitAck(ack, { success: false, message: 'Only users can join user room' });
      return;
    }

    const room = userRoom(socket.user._id);
    socket.join(room);
    emitAck(ack, { success: true, room });
  });

  socket.on(SOCKET_EVENTS.DRIVER_JOIN, async (_payload, ack) => {
    if (socket.user.role !== 'driver' && socket.user.role !== 'admin') {
      emitAck(ack, { success: false, message: 'Only drivers can join driver room' });
      return;
    }

    const room = driverRoom(socket.user._id);
    socket.join(room);

    const vehicle = await Vehicle.findOne({
      $or: [{ assignedDriver: socket.user._id }, { driverId: socket.user._id }],
      status: { $ne: 'inactive' }
    }).sort({ updatedAt: -1 });

    if (vehicle) {
      socket.join(vehicleTrackingRoom(vehicle._id));
      emitVehicleStatus(io, {
        vehicleId: vehicle._id.toString(),
        driverId: socket.user._id.toString(),
        assignedUserId: vehicle.assignedUser ? vehicle.assignedUser.toString() : null
      }, 'online');
      await emitFleetSummary(io);
    }

    emitAck(ack, {
      success: true,
      room,
      vehicleId: vehicle?._id || null
    });
  });
}

function registerTripHandlers(io, socket) {
  socket.on(SOCKET_EVENTS.TRIP_START, async (payload, ack) => {
    try {
      const driverId = socket.user.role === 'admin' && payload?.driverId ? payload.driverId : socket.user._id;
      const trip = await tripService.startTrip(driverId, payload || {});

      const statusPayload = {
        tripId: trip._id,
        vehicleId: trip.vehicle?._id || trip.vehicle,
        driverId: trip.driver?._id || trip.driver,
        status: 'on_trip',
        timestamp: new Date().toISOString()
      };

      io.to(ADMIN_DASHBOARD_ROOM).emit(SOCKET_EVENTS.VEHICLE_STATUS, statusPayload);
      io.to(vehicleTrackingRoom(statusPayload.vehicleId)).emit(SOCKET_EVENTS.VEHICLE_STATUS, statusPayload);
      if (trip.user?._id || trip.user) {
        io.to(userRoom((trip.user._id || trip.user).toString())).emit(SOCKET_EVENTS.ASSIGNED_VEHICLE_STATUS, statusPayload);
      }
      await emitFleetSummary(io);

      emitAck(ack, { success: true, trip });
    } catch (error) {
      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, { message: error.message });
      emitAck(ack, { success: false, message: error.message });
    }
  });

  socket.on(SOCKET_EVENTS.TRIP_STOP, async (payload, ack) => {
    try {
      const trip = await tripService.stopTrip(payload?.tripId, socket.user._id, payload || {}, {
        isAdmin: socket.user.role === 'admin'
      });

      const statusPayload = {
        tripId: trip._id,
        vehicleId: trip.vehicle?._id || trip.vehicle,
        driverId: trip.driver?._id || trip.driver,
        status: 'active',
        timestamp: new Date().toISOString()
      };

      io.to(ADMIN_DASHBOARD_ROOM).emit(SOCKET_EVENTS.VEHICLE_STATUS, statusPayload);
      io.to(vehicleTrackingRoom(statusPayload.vehicleId)).emit(SOCKET_EVENTS.VEHICLE_STATUS, statusPayload);
      if (trip.user?._id || trip.user) {
        io.to(userRoom((trip.user._id || trip.user).toString())).emit(SOCKET_EVENTS.ASSIGNED_VEHICLE_STATUS, statusPayload);
      }
      await emitFleetSummary(io);

      emitAck(ack, { success: true, trip });
    } catch (error) {
      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, { message: error.message });
      emitAck(ack, { success: false, message: error.message });
    }
  });
}

function registerLocationUpdateHandler(io, socket) {
  async function handleLocationUpdate(payload, ack) {
    try {
      if (socket.user.role !== 'driver') {
        throw new Error('Only drivers can send location updates');
      }

      const driverId = socket.user._id.toString();
      if (!canAcceptLocationUpdate(driverId)) {
        emitAck(ack, { success: false, throttled: true, message: 'Location update throttled' });
        return;
      }

      const location = await locationService.saveDriverLocation(socket.user._id, payload || {});

      io.to(ADMIN_DASHBOARD_ROOM).emit(SOCKET_EVENTS.VEHICLE_LOCATION, location);
      io.to(vehicleTrackingRoom(location.vehicleId)).emit(SOCKET_EVENTS.VEHICLE_LOCATION, location);

      if (location.assignedUserId) {
        io.to(userRoom(location.assignedUserId)).emit(SOCKET_EVENTS.ASSIGNED_VEHICLE_LOCATION, location);
      }

      emitVehicleStatus(io, location, location.vehicleStatus || 'active');

      await emitGeoFenceAlerts(io, socket, location);

      await emitFleetSummary(io);

      emitAck(ack, { success: true, location });
    } catch (error) {
      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, { message: error.message || 'Unable to update location' });
      emitAck(ack, { success: false, message: error.message || 'Unable to update location' });
    }
  }

  socket.on(SOCKET_EVENTS.LOCATION_UPDATE, handleLocationUpdate);
}

function registerDisconnectHandler(io, socket) {
  socket.on('disconnect', async () => {
    if (socket.user.role !== 'driver') {
      return;
    }

    lastLocationUpdateByDriver.delete(socket.user._id.toString());

    const vehicle = await Vehicle.findOne({
      $or: [{ assignedDriver: socket.user._id }, { driverId: socket.user._id }]
    }).sort({ updatedAt: -1 });

    if (!vehicle) {
      return;
    }

    const location = {
      vehicleId: vehicle._id.toString(),
      driverId: socket.user._id.toString(),
      assignedUserId: vehicle.assignedUser ? vehicle.assignedUser.toString() : null
    };

    await locationCacheService.removeVehicleLiveLocation(vehicle._id);
    emitVehicleStatus(io, location, 'offline');
    await emitFleetSummary(io);
  });
}

function registerLocationSocket(io, socket) {
  if (socket.user.role === 'admin') {
    socket.join(ADMIN_DASHBOARD_ROOM);
  }

  if (socket.user.role === 'user') {
    socket.join(userRoom(socket.user._id));
  }

  if (socket.user.role === 'driver') {
    socket.join(driverRoom(socket.user._id));
  }

  registerRoleJoinHandlers(io, socket);
  registerTripHandlers(io, socket);
  registerLocationUpdateHandler(io, socket);
  registerDisconnectHandler(io, socket);
}

module.exports = { registerLocationSocket };
