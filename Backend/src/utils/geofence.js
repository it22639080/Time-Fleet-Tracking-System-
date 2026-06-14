const { calculateHaversineDistance } = require('./distance');

function normalizePoint(point) {
  return {
    lat: Number(point.lat ?? point.latitude),
    lng: Number(point.lng ?? point.longitude)
  };
}

function isPointInsideCircle(point, center, radius) {
  const normalizedPoint = normalizePoint(point);
  const normalizedCenter = normalizePoint(center);
  const radiusMeters = Number(radius);

  if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) {
    return false;
  }

  return calculateHaversineDistance(normalizedPoint, normalizedCenter) <= radiusMeters;
}

function isPointInsidePolygon(point, polygonCoordinates = []) {
  const normalizedPoint = normalizePoint(point);
  const polygon = polygonCoordinates.map(normalizePoint);

  if (polygon.length < 3) {
    return false;
  }

  let inside = false;

  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current) {
    const currentPoint = polygon[current];
    const previousPoint = polygon[previous];

    const intersects =
      currentPoint.lng > normalizedPoint.lng !== previousPoint.lng > normalizedPoint.lng
      && normalizedPoint.lat
        < ((previousPoint.lat - currentPoint.lat) * (normalizedPoint.lng - currentPoint.lng))
          / (previousPoint.lng - currentPoint.lng)
          + currentPoint.lat;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

module.exports = {
  isPointInsideCircle,
  isPointInsidePolygon,
  normalizePoint
};
