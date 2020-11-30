const route = require('express').Router()
const authController = require('../controllers/auth')
const checkPhoneController = require('../controllers/checkPhoneNumber')

route.post('/check', checkPhoneController.checking)
route.post('/login', authController.login)
route.post('/login/phone', authController.loginWithPhoneNumber)
route.post('/signup', authController.signUp)
route.post('/signup/phone', authController.signUpWithPhoneNumber)
route.post('/reset', authController.getResetCode) // send reset code
route.post('/verify/reset', authController.resetPasswordVerifiyResetCode) // verify reset code

module.exports = route
