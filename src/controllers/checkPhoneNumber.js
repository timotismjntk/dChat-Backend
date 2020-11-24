/* eslint-disable camelcase */
/* eslint-disable node/handle-callback-err */
const { User } = require('../models')
const joi = require('joi')
const response = require('../helpers/responseStandard')

module.exports = {
  checking: async (req, res) => {
    const schema = joi.object({
      phone_number: joi.string()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return response(res, 'Error', { error: error.message }, 400, false)
    } else {
      const { phone_number } = results
      console.log(results)
      try {
        const isExist = await User.findOne({ where: { phone_number } })
        if (isExist) {
          console.log(isExist.dataValues)
          if (isExist) {
            return response(res, 'Phone is already registered', {}, 400, false)
          }
        } else {
          return response(res, 'You can use this phone number', {})
        }
      } catch (e) {
        return response(res, e.message, {}, 500, false)
      }
    }
  }
}
