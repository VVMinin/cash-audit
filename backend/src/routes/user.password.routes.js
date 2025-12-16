const express = require('express');
const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/user.password.controller');

const router = express.Router();

router.use(auth);

router.put('/change-password', controller.changePassword);

module.exports = router;




