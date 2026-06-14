const router = require('express').Router();

const tripController = require('../controllers/trip.controller');
const {
  authorizeRoles,
  authorizeTripAccess,
  protect
} = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', authorizeRoles('admin'), tripController.createTrip);
router.get('/', authorizeRoles('admin'), tripController.getTrips);

router.post('/start', authorizeRoles('admin', 'driver'), tripController.startTrip);
router.get('/my-trips', authorizeRoles('admin', 'driver'), tripController.getDriverTrips);
router.get('/active', authorizeRoles('admin', 'driver'), tripController.getDriverActiveTrip);
router.get('/my-tracking', authorizeRoles('admin', 'user'), tripController.getUserActiveTrip);
router.get('/my-history', authorizeRoles('admin', 'user'), tripController.getUserTrips);

router.get('/:id/route', authorizeRoles('admin', 'driver', 'user'), authorizeTripAccess('id'), tripController.getTripRoute);
router.get('/:id/summary', authorizeRoles('admin', 'driver', 'user'), authorizeTripAccess('id'), tripController.getTripSummary);
router.get('/:id', authorizeRoles('admin', 'driver', 'user'), authorizeTripAccess('id'), tripController.getTripById);
router.patch('/:id/cancel', authorizeRoles('admin'), tripController.cancelTrip);
router.patch('/:id/stop', authorizeRoles('admin', 'driver'), tripController.stopTrip);

module.exports = router;
