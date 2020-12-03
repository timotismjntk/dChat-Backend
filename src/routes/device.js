const route = require('express').Router()
const authMiddleware = require('../middleware/authentication')
const deviceController = require('../controllers/device')

route.get('/remove', authMiddleware.authUser, deviceController.removeDeviceToken)
route.patch('/add', deviceController.setDeviceToken)
module.exports = route
