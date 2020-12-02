// const decodedToken = await firebase.auth().verifyIdToken(idToken)

const admin = require.main.require('firebase-admin')

export default function firebaseAuthMiddleware (req, res, next) {
  const authorization = req.header('Authorization')
  if (authorization) {
    const token = authorization.split(' ')
    admin.auth().verifyIdToken(token[1])
      .then((decodedToken) => {
        console.log(decodedToken)
        res.locals.user = decodedToken
        next()
      })
      .catch(err => {
        console.log(err)
        res.sendStatus(401)
      })
  } else {
    console.log('Authorization header is not found')
    res.sendStatus(401)
  }
}
