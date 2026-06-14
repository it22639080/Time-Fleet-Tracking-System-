const router = require('express').Router();

const authRoutes = require('./auth.routes');
const alertRoutes = require('./alert.routes');
const driverRoutes = require('./driver.routes');
const geoFenceRoutes = require('./geo-fence.routes');
const trackingRoutes = require('./tracking.routes');
const tripRoutes = require('./trip.routes');
const userRoutes = require('./user.routes');
const vehicleRoutes = require('./vehicle.routes');

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'fleet-tracking-backend'
  });
});

router.use('/auth', authRoutes);
router.use('/alerts', alertRoutes);
router.use('/drivers', driverRoutes);
router.use('/geo-fences', geoFenceRoutes);
router.use('/geofences', geoFenceRoutes);
router.use('/tracking', trackingRoutes);
router.use('/trips', tripRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);

module.exports = router;
