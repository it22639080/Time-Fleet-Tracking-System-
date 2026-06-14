const router = require('express').Router();

const trackingController = require('../controllers/tracking.controller');
const { authorizeRoles, authorizeVehicleAccess, protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get(
  '/vehicles/:vehicleId/live',
  authorizeRoles('admin', 'user', 'driver'),
  authorizeVehicleAccess('vehicleId'),
  trackingController.getLiveVehicleLocation
);
router.get('/vehicles/:vehicleId/history', authorizeRoles('admin'), trackingController.getVehicleRouteHistory);

module.exports = router;
