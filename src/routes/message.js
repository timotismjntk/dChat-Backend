const route = require('express').Router()
const authMiddleware = require('../middleware/authentication')
const messageController = require('../controllers/message')

route.get('/', authMiddleware.authUser, messageController.getAllMessages)
route.get('/:recieptId', authMiddleware.authUser, messageController.getMessages)
route.post('/', authMiddleware.authUser, messageController.postMessage)
route.patch('/update/:msgId', authMiddleware.authUser, messageController.editMessage)
route.delete('/:msgId', authMiddleware.authUser, messageController.deleteMessage)

module.exports = route
