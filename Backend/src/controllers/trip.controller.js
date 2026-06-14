const tripService = require('../services/trip.service');
const asyncHandler = require('../utils/async-handler');

const createTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.createTrip(req.body);

  res.status(201).json({ trip });
});

const getTrips = asyncHandler(async (req, res) => {
  const result = await tripService.getTrips(req.query);

  res.status(200).json(result);
});

const getTripById = asyncHandler(async (req, res) => {
  const trip = req.trip || (await tripService.getTripById(req.params.id));

  res.status(200).json({ trip });
});

const getTripRoute = asyncHandler(async (req, res) => {
  const route = await tripService.getTripRoute(req.params.id);

  res.status(200).json(route);
});

const getTripSummary = asyncHandler(async (req, res) => {
  const summary = await tripService.getTripSummary(req.params.id);

  res.status(200).json({ summary });
});

const cancelTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.cancelTrip(req.params.id);

  res.status(200).json({
    message: 'Trip cancelled successfully',
    trip
  });
});

const startTrip = asyncHandler(async (req, res) => {
  const driverId = req.user.role === 'admin' && req.body.driverId ? req.body.driverId : req.user._id;
  const trip = await tripService.startTrip(driverId, req.body);

  res.status(200).json({
    message: 'Trip started successfully',
    trip
  });
});

const stopTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.stopTrip(req.params.id, req.user._id, req.body, {
    isAdmin: req.user.role === 'admin'
  });

  res.status(200).json({
    message: 'Trip completed successfully',
    trip
  });
});

const getDriverTrips = asyncHandler(async (req, res) => {
  const result = await tripService.getDriverTrips(req.user._id, req.query);

  res.status(200).json(result);
});

const getDriverActiveTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.getDriverActiveTrip(req.user._id);

  res.status(200).json({ trip });
});

const getUserActiveTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.getUserActiveTrip(req.user._id);

  res.status(200).json({ trip });
});

const getUserTrips = asyncHandler(async (req, res) => {
  const result = await tripService.getUserTrips(req.user._id, req.query);

  res.status(200).json(result);
});

module.exports = {
  cancelTrip,
  createTrip,
  getDriverActiveTrip,
  getDriverTrips,
  getTripById,
  getTripRoute,
  getTripSummary,
  getTrips,
  getUserActiveTrip,
  getUserTrips,
  startTrip,
  stopTrip
};
