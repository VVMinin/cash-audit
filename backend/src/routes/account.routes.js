const express = require('express')
const auth = require('../middlewares/auth.middleware')
const accountController = require('../controllers/account.controller')

const router = express.Router()

router.use(auth)

router.get('/', accountController.list)
router.post('/', accountController.create)
router.put('/:id', accountController.update)
router.delete('/:id', accountController.remove)

module.exports = router


