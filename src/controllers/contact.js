/* eslint-disable camelcase */
const response = require('../helpers/response')
const { User } = require('../models')

module.exports = {
  getAllContact: async (req, res) => {
    const results = await User.findAll({
      include: [{
        model: User,
        attributes: {
          exclude: ['password', 'email', 'phone_number', 'reset_code']
        }
      }]

    })
    return response(res, 'List of All Contact', { results })
  },
  getContactById: async (req, res) => {
    const { id } = req.params
    const results = await User.findByPk(id)
    if (results) {
      return response(res, `Detail of user with id ${id}`, { results })
    }
    return response(res, 'User not found', { results }, 404, false)
  }
}
