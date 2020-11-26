const route = require('express').Router()
const authMiddleware = require('../middleware/authentication')
const contactController = require('../controllers/contact')

route.get('/', authMiddleware.authUser, contactController.getAllContact)
route.get('/:contactId', authMiddleware.authUser, contactController.getContactById)
route.post('/:contactId', authMiddleware.authUser, contactController.addContact)

module.exports = route
