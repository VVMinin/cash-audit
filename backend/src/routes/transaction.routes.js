const express = require('express')
const auth = require('../middlewares/auth.middleware')
const controller = require('../controllers/transaction.controller')

const router = express.Router()

router.use(auth)

router.get('/', controller.list)
router.get('/analytics', controller.analytics)
router.post('/', controller.create)
router.get('/:id', controller.getOne)
router.put('/:id', controller.update)
router.delete('/:id', controller.remove)

module.exports = router

