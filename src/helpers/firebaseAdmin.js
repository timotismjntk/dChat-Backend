const admin = require('firebase-admin')

const serviceAccount = require('../config/dchat-e3451-firebase-adminsdk-5ahco-a5d5f2c406.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://dchat-e3451.firebaseio.com'
})

const messaging = admin.messaging()

module.exports = messaging
