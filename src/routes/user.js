const route = require('express').Router()
const authMiddleware = require('../middleware/authentication')
const userController = require('../controllers/user')
const uploadAvatar = require('../controllers/uploadAvatar')

route.get('/', authMiddleware.authUser, userController.getDetailProfile)
route.patch('/update', authMiddleware.authUser, userController.updateUserProfile)
route.patch('/update/picture', authMiddleware.authUser, uploadAvatar.updateAvatar)
route.patch('/reset/password', userController.resetPassword)
route.delete('/', authMiddleware.authUser, userController.deleteUser)

module.exports = route
