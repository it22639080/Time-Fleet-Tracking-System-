const driverService = require('../services/driver.service');
const AppError = require('../utils/app-error');
const asyncHandler = require('../utils/async-handler');

function canViewDriverProfile(req) {
  return req.user.role === 'admin' || (req.user.role === 'driver' && req.user._id.equals(req.params.driverId));
}

const getAllDrivers = asyncHandler(async (_req, res) => {
  const drivers = await driverService.getAllDrivers();

  res.status(200).json({ drivers });
});

const getDriverProfile = asyncHandler(async (req, res) => {
  if (!canViewDriverProfile(req)) {
    throw new AppError('You do not have permission to access this driver profile', 403);
  }

  const driver = await driverService.getDriverProfile(req.params.driverId);

  res.status(200).json({ driver });
});

const updateDriverProfile = asyncHandler(async (req, res) => {
  const driver = await driverService.updateDriverProfile(req.params.driverId, req.body);

  res.status(200).json({ driver });
});

const assignVehicleToDriver = asyncHandler(async (req, res) => {
  const vehicle = await driverService.assignVehicleToDriver(req.params.driverId, req.body);

  res.status(200).json({ vehicle });
});

const activateDriver = asyncHandler(async (req, res) => {
  const driver = await driverService.setDriverActiveStatus(req.params.driverId, true);

  res.status(200).json({ driver });
});

const deactivateDriver = asyncHandler(async (req, res) => {
  const driver = await driverService.setDriverActiveStatus(req.params.driverId, false);

  res.status(200).json({ driver });
});

module.exports = {
  activateDriver,
  assignVehicleToDriver,
  deactivateDriver,
  getAllDrivers,
  getDriverProfile,
  updateDriverProfile
};
