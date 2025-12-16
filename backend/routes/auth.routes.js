const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/auth');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', auth, authController.me);

module.exports = router;



