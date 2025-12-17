const express = require('express')
const auth = require('../middlewares/auth.middleware')
const admin = require('../middlewares/admin.middleware')
const controller = require('../controllers/admin.users.controller')

const router = express.Router()

router.use(auth, admin)

router.get('/', controller.list)
router.post('/', controller.create)
router.put('/:id', controller.update)
router.put('/:id/password', controller.updatePassword)
router.delete('/:id', controller.remove)

module.exports = router


