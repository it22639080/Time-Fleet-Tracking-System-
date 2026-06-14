const EARTH_RADIUS_METERS = 6371000;

function toRadians(value) {
  return (Number(value) * Math.PI) / 180;
}

function calculateHaversineDistance(pointA, pointB) {
  const latDelta = toRadians(pointB.lat - pointA.lat);
  const lngDelta = toRadians(pointB.lng - pointA.lng);
  const startLat = toRadians(pointA.lat);
  const endLat = toRadians(pointB.lat);

  const haversine =
    Math.sin(latDelta / 2) ** 2
    + Math.cos(startLat) * Math.cos(endLat) * Math.sin(lngDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function calculateRouteDistance(routePoints = []) {
  if (!Array.isArray(routePoints) || routePoints.length < 2) {
    return 0;
  }

  return routePoints.reduce((total, point, index) => {
    if (index === 0) {
      return total;
    }

    return total + calculateHaversineDistance(routePoints[index - 1], point);
  }, 0);
}

module.exports = {
  calculateHaversineDistance,
  calculateRouteDistance
};
