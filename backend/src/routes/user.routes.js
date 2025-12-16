const express = require('express')
const auth = require('../middlewares/auth.middleware')
const admin = require('../middlewares/admin.middleware')
const controller = require('../controllers/user.controller')

const router = express.Router()

router.use(auth)

router.get('/me', controller.getMe)
router.put('/me', controller.updateMe)
router.get('/', admin, controller.listAll)

module.exports = router

