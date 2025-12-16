const express = require('express')
const auth = require('../middlewares/auth.middleware')
const categoryController = require('../controllers/category.controller')

const router = express.Router()

router.use(auth)

router.get('/', categoryController.list)
router.post('/', categoryController.create)
router.put('/:id', categoryController.update)
router.delete('/:id', categoryController.remove)

module.exports = router


