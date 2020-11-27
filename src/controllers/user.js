/* eslint-disable no-const-assign */
/* eslint-disable camelcase */
const bcrypt = require('bcryptjs')
const response = require('../helpers/responseStandard')
const { User } = require('../models')
const joi = require('joi')

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
      unique_id: joi.string()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return response(res, 'Error', { error: error.message }, 400, false)
    } else {
      const { username, email, password, phone_number, unique_id } = results
      const check = await User.findByPk(id)
      if (check) {
        if (username || email || password || phone_number || unique_id) {
          const data = { username, email, phone_number, unique_id }
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
