const router = require('express').Router();

const driverController = require('../controllers/driver.controller');
const { authorizeRoles, protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', authorizeRoles('admin'), driverController.getAllDrivers);
router.get('/:driverId', driverController.getDriverProfile);

router.patch('/:driverId', authorizeRoles('admin'), driverController.updateDriverProfile);
router.patch('/:driverId/vehicle', authorizeRoles('admin'), driverController.assignVehicleToDriver);
router.patch('/:driverId/activate', authorizeRoles('admin'), driverController.activateDriver);
router.patch('/:driverId/deactivate', authorizeRoles('admin'), driverController.deactivateDriver);

module.exports = router;
