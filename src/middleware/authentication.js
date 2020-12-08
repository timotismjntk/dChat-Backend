const jwt = require('jsonwebtoken')
const responseStandard = require('../helpers/responseStandard')
const {
  APP_KEY
} = process.env

module.exports = {
  authUser: (req, res, next) => {
    const { authorization } = req.headers
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.slice(7, authorization.length)
      try {
        const payload = jwt.verify(token, APP_KEY)
        if (payload) {
          req.user = payload
          next()
        } else {
          return responseStandard(res, 'Unauthorized', {}, 401, false)
        }
      } catch (err) {
        return responseStandard(res, err.message, {}, 500, false)
      }
    } else {
      return responseStandard(res, 'Forbidden Access', {}, 403, false)
    }
  },
  authRole: (role) => {
    return (req, res, next) => {
      if (req.user.role_id !== role) {
        return responseStandard(res, 'You dont Have Access', {}, 401, false)
      }
      console.log(role)
      next()
    }
  },
  checkExpiredToken: async (req, res, next) => {
    const { authorization } = req.headers
    const token = authorization.slice(7, authorization.length)
    try {
      const payload = await jwt.verify(token, APP_KEY)
      if (payload) {
        console.log('token still valid')
        return responseStandard(res, 'token still valid', { payload })
      } else {
        return responseStandard(res, 'Unauthorized', {}, 401, false)
      }
    } catch (e) {
      if (e.message === 'jwt expired') {
        return responseStandard(res, 'Your session is expired, please log in again', {}, 401, false)
      } else {
        return responseStandard(res, e, {}, 500, false)
      }
    }
  }
}
