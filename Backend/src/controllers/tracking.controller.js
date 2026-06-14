const trackingService = require('../services/tracking.service');
const asyncHandler = require('../utils/async-handler');

const getLiveVehicleLocation = asyncHandler(async (req, res) => {
  const location = await trackingService.getLiveVehicleLocation(req.params.vehicleId);

  res.status(200).json({ location });
});

const getVehicleRouteHistory = asyncHandler(async (req, res) => {
  const history = await trackingService.getVehicleRouteHistory(req.params.vehicleId, req.query);

  res.status(200).json({
    count: history.length,
    history
  });
});

module.exports = {
  getLiveVehicleLocation,
  getVehicleRouteHistory
};
