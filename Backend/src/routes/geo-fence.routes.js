const router = require('express').Router();

const geoFenceController = require('../controllers/geo-fence.controller');
const { authorizeRoles, protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', authorizeRoles('admin'), geoFenceController.createGeoFence);
router.get('/', authorizeRoles('admin'), geoFenceController.getGeoFences);
router.get('/:id', authorizeRoles('admin'), geoFenceController.getGeoFenceById);
router.put('/:id', authorizeRoles('admin'), geoFenceController.updateGeoFence);
router.delete('/:id', authorizeRoles('admin'), geoFenceController.deleteGeoFence);

module.exports = router;
