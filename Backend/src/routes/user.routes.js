const router = require('express').Router();

const userController = require('../controllers/user.controller');
const { authorizeRoles, protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', authorizeRoles('admin'), userController.getUsers);

module.exports = router;
