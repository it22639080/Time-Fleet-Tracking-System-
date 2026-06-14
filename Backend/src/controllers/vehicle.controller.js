const vehicleService = require('../services/vehicle.service');
const asyncHandler = require('../utils/async-handler');

const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.body, req.user._id);

  res.status(201).json({ vehicle });
});

const getVehicles = asyncHandler(async (req, res) => {
  const result = await vehicleService.getVehicles(req.query);

  res.status(200).json(result);
});

const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);

  res.status(200).json({ vehicle });
});

const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);

  res.status(200).json({ vehicle });
});

const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.deactivateVehicle(req.params.id);

  res.status(200).json({
    message: 'Vehicle deactivated successfully',
    vehicle
  });
});

const assignDriver = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.assignDriver(req.params.id, req.body.driverId);

  res.status(200).json({ vehicle });
});

const assignUser = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.assignUser(req.params.id, req.body.userId);

  res.status(200).json({ vehicle });
});

const getMyVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleForDriver(req.user._id);

  res.status(200).json({ vehicle });
});

const getMyTrackingVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleForUser(req.user._id);

  res.status(200).json({ vehicle });
});

module.exports = {
  assignDriver,
  assignUser,
  createVehicle,
  deleteVehicle,
  getMyTrackingVehicle,
  getMyVehicle,
  getVehicleById,
  getVehicles,
  updateVehicle
};
