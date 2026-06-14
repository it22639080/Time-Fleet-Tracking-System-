const router = require('express').Router();

const vehicleController = require('../controllers/vehicle.controller');
const { authorizeRoles, protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/my-vehicle', authorizeRoles('admin', 'driver'), vehicleController.getMyVehicle);
router.get('/my-tracking', authorizeRoles('admin', 'user'), vehicleController.getMyTrackingVehicle);

router.post('/', authorizeRoles('admin'), vehicleController.createVehicle);
router.get('/', authorizeRoles('admin'), vehicleController.getVehicles);
router.get('/:id', authorizeRoles('admin'), vehicleController.getVehicleById);
router.put('/:id', authorizeRoles('admin'), vehicleController.updateVehicle);
router.delete('/:id', authorizeRoles('admin'), vehicleController.deleteVehicle);
router.patch('/:id/assign-driver', authorizeRoles('admin'), vehicleController.assignDriver);
router.patch('/:id/assign-user', authorizeRoles('admin'), vehicleController.assignUser);

module.exports = router;
