const router = require('express').Router();

const alertController = require('../controllers/alert.controller');
const { authorizeRoles, protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', authorizeRoles('admin'), alertController.getAlerts);
router.patch('/read-all', authorizeRoles('admin'), alertController.markAllAlertsRead);
router.patch('/:id/read', authorizeRoles('admin'), alertController.markAlertRead);

module.exports = router;
