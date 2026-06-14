const geoFenceService = require('../services/geo-fence.service');
const asyncHandler = require('../utils/async-handler');

const createGeoFence = asyncHandler(async (req, res) => {
  const geofence = await geoFenceService.createGeoFence(req.body, req.user._id);

  res.status(201).json({ geofence });
});

const getGeoFences = asyncHandler(async (req, res) => {
  const geofences = await geoFenceService.getGeoFences(req.query);

  res.status(200).json({ geofences });
});

const getGeoFenceById = asyncHandler(async (req, res) => {
  const geofence = await geoFenceService.getGeoFenceById(req.params.id);

  res.status(200).json({ geofence });
});

const updateGeoFence = asyncHandler(async (req, res) => {
  const geofence = await geoFenceService.updateGeoFence(req.params.id, req.body);

  res.status(200).json({ geofence });
});

const deleteGeoFence = asyncHandler(async (req, res) => {
  const geofence = await geoFenceService.deleteGeoFence(req.params.id);

  res.status(200).json({
    message: 'Geofence deactivated successfully',
    geofence
  });
});

module.exports = {
  createGeoFence,
  deleteGeoFence,
  getGeoFenceById,
  getGeoFences,
  updateGeoFence
};
