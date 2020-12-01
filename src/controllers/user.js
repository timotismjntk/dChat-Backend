/* eslint-disable node/handle-callback-err */
/* eslint-disable no-const-assign */
/* eslint-disable camelcase */
const bcrypt = require('bcryptjs')
const response = require('../helpers/responseStandard')
const { User } = require('../models')
const joi = require('joi')
const { Op } = require('sequelize')

module.exports = {
  getDetailProfile: async (req, res) => {
    const { id } = req.user
    const results = await User.findByPk(id)
    if (results) {
      try {
        await results.update({ last_active: new Date().getTime() })
      } catch (e) {

      }
      return response(res, `Detail of user with id ${id}`, { results })
    }
    return response(res, 'User not found', { results }, 404, false)
  },
  updateUserProfile: async (req, res) => {
    const { id } = req.user
    const schema = joi.object({
      username: joi.string(),
      email: joi.string(),
      password: joi.string(),
      phone_number: joi.string(),
      unique_id: joi.string(),
      deviceToken: joi.string()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return response(res, 'Error', { error: error.message }, 400, false)
    } else {
      const { username, email, password, phone_number, unique_id, deviceToken } = results
      const check = await User.findByPk(id)
      if (check) {
        if (username || email || password || phone_number || unique_id || deviceToken) {
          const data = { username, email, phone_number, unique_id, deviceToken }
          try {
            await check.update(data)
            return response(res, 'User updated successfully', { check })
          } catch (err) {
            return response(res, err.message, {}, 400, false)
          }
        } else if (password) {
          try {
            const salt = await bcrypt.genSalt()
            password = await bcrypt.hash(password, salt)
            const data = {
              password
            }
            await check.update(data)
            return response(res, 'User updated successfully', { results })
          } catch (err) {
            return response(res, err.message, {}, 400, false)
          }
        }
        return response(res, 'Atleast fill one column', {}, 400, false)
      }
      return response(res, 'User not found', {}, 404, false)
    }
  },
  resetPassword: async (req, res) => {
    const schema = joi.object({
      email: joi.string(),
      phone_number: joi.string(),
      oldPassword: joi.string().required(),
      newPassword: joi.string().required()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return response(res, 'Error', { error: error.message }, 400, false)
    } else {
      const { email, oldPassword, newPassword, phone_number } = results
      try {
        if (email || phone_number) {
          const check = await User.findOne({
            where: { [Op.or]: [{ email: email }, { phone_number: phone_number }] },
            attributes: ['id', 'password']
          })
          if (check) {
            await bcrypt.compare(oldPassword, check.dataValues.password, async (err, result) => {
              if (result) {
                if (newPassword === oldPassword) {
                  return response(res, 'New password can\'t be same with old password', {}, 400, false)
                } else {
                  try {
                    const salt = await bcrypt.genSalt()
                    const hashedPassword = await bcrypt.hash(newPassword, salt)
                    check.update({ password: hashedPassword })
                    return response(res, 'Password reset successfully', {})
                  } catch (e) {
                    return response(res, e.message, {}, 500, false)
                  }
                }
              } else {
                return response(res, 'Password wrong!', {}, 400, false)
              }
            })
          }
        }
      } catch (e) {
        return response(res, e.message, {}, 500, false)
      }
    }
  },
  deleteUser: async (req, res) => {
    const { id } = req.user
    const results = await User.findByPk(id)
    if (results) {
      await results.destroy()
      return response(res, 'User deleted successfully', {})
    }
    return response(res, 'User not found', {}, 404, false)
  }
}
