/* eslint-disable camelcase */
const response = require('../helpers/responseStandard')
const { User } = require('../models')
const joi = require('joi')
const { Op } = require('sequelize')

module.exports = {
  setDeviceToken: async (req, res) => {
    const schema = joi.object({
      deviceToken: joi.string(),
      email: joi.string(),
      phone_number: joi.string()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return response(res, 'Error', { error: error.message }, 400, false)
    } else {
      const { deviceToken, email, phone_number } = results
      if (email) {
        try {
          const check = await User.findOne({
            where: { email: email },
            attributes: ['id', 'password']
          })
          if (check) {
            check.update({ deviceToken: deviceToken })
            return response(res, 'Device token is set', {}, 200, true)
          } else {
            return response(res, 'Fail to set device token', {}, 400, false)
          }
        } catch (e) {
          return response(res, e.message, {}, 500, false)
        }
      } else if (phone_number) {
        try {
          const check = await User.findOne({
            where: { phone_number: phone_number },
            attributes: ['id', 'password']
          })
          if (check) {
            check.update({ deviceToken: deviceToken })
            return response(res, 'Device token is set', {}, 200, true)
          } else {
            return response(res, 'Fail to set device token', {}, 400, false)
          }
        } catch (e) {
          return response(res, e.message, {}, 500, false)
        }
      }
    }
  },
  removeDeviceToken: async (req, res) => {
    const { id } = req.user
    const results = await User.findByPk(id)
    if (results) {
      await results.update({ deviceToken: '' })
      return response(res, 'Device token is removed', {}, 200, true)
    } else {
      return response(res, 'Users not found', {}, 404, false)
    }
  }
  // checkDeviceToken: async (req, res, next) => {
  //   const { id, deviceToken } = req.user
  //   const schema = joi.object({
  //     tokenDevice: joi.string(),
  //   })
  //   const { value: results, error } = schema.validate(req.body)
  //   if (error) {
  //     return response(res, 'Error', { error: error.message }, 400, false)
  //   } else {
  //     const { tokenDevice } = results
  //     if (deviceToken) {
  //       const search = await User.findByPk(id)
  //       if (search) {
  //         search.update({})
  //       }
  //       const { deviceToken } = search.dataValues
  //     }
  //   }
  // }
}
