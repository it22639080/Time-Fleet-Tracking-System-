const SOCKET_EVENTS = {
  ADMIN_JOIN: 'admin:join',
  USER_JOIN: 'user:join',
  DRIVER_JOIN: 'driver:join',
  DRIVER_CONNECT: 'driver:connect',
  LOCATION_UPDATE: 'location:update',
  DRIVER_LOCATION_UPDATE: 'driver:location:update',
  DRIVER_DISCONNECT: 'driver:disconnect',
  TRIP_START: 'trip:start',
  TRIP_STOP: 'trip:stop',
  VEHICLE_LOCATION: 'vehicle:location',
  VEHICLE_STATUS: 'vehicle:status',
  ASSIGNED_VEHICLE_LOCATION: 'assignedVehicle:location',
  ASSIGNED_VEHICLE_STATUS: 'assignedVehicle:status',
  FLEET_SUMMARY: 'fleet:summary',
  ALERT_NEW: 'alert:new',
  GEOFENCE_WARNING: 'geofence:warning',
  VEHICLE_TRACK: 'vehicle:track',
  VEHICLE_UNTRACK: 'vehicle:untrack',
  GEO_FENCE_BREACH: 'geo-fence-breach',
  SOCKET_ERROR: 'socket:error'
};

module.exports = { SOCKET_EVENTS };
