const ADMIN_DASHBOARD_ROOM = 'admin:dashboard';

function vehicleTrackingRoom(vehicleId) {
  return `vehicle:${vehicleId}:tracking`;
}

function driverRoom(driverId) {
  return `driver:${driverId}`;
}

function userRoom(userId) {
  return `user:${userId}`;
}

module.exports = {
  ADMIN_DASHBOARD_ROOM,
  driverRoom,
  userRoom,
  vehicleTrackingRoom
};
