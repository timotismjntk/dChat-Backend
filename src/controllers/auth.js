/* eslint-disable camelcase */
/* eslint-disable node/handle-callback-err */
const { User } = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const joi = require('joi')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const multerHelper = require('../helpers/uploadHelper')
const fs = require('fs')
const response = require('../helpers/responseStandard')
const { Op } = require('sequelize')

const {
  APP_KEY,
  TOKEN_EXP
} = process.env

module.exports = {
  login: async (req, res) => {
    const schema = joi.object({
      email: joi.string().required(),
      password: joi.string().required(),
      deviceToken: joi.string().required()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return response(res, 'Error', { error: error.message }, 400, false)
    } else {
      const { email, password, deviceToken } = results
      try {
        const isExist = await User.findOne({ where: { email: email } })
        if (isExist) {
          console.log(isExist.dataValues)
          if (isExist.dataValues.password) {
            try {
              await bcrypt.compare(password, isExist.dataValues.password, (err, result) => {
                if (result) {
                  const { id } = isExist.dataValues
                  jwt.sign({ id: id, deviceToken: deviceToken }, APP_KEY, { expiresIn: TOKEN_EXP }, async (err, token) => {
                    try {
                      await isExist.update({ last_active: new Date() })
                    } catch (e) {

                    }
                    return response(res, 'Login succesfully', { token }, 200, true)
                  })
                } else {
                  return response(res, 'Wrong email or password', {}, 400, false)
                }
              })
            } catch (e) {
              return response(res, e.message, {}, 500, false)
            }
          }
        } else {
          console.log(isExist)
          return response(res, 'Wrong email or password', {}, 400, false)
        }
      } catch (e) {
        return response(res, e.message, {}, 500, false)
      }
    }
  },
  signUp: async (req, res) => {
    const schema = joi.object({
      username: joi.string().required(),
      email: joi.string().required(),
      password: joi.string().required(),
      phone_number: joi.string().required()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return response(res, 'Error', { error: error.message }, 400, false)
    } else {
      let { username, email, password, phone_number } = results
      try {
        password = await bcrypt.hash(password, await bcrypt.genSalt())
        const data = {
          username,
          email,
          password,
          phone_number
        }
        const isExist = await User.findOne({ where: { email: email } })
        // console.log(isExist === null)
        if (isExist) {
          return response(res, 'Email has been used', {}, 400, false)
        } else {
          console.log(data)
          const results = await User.create(data)
          return response(res, 'User created successfully', { results })
        }
      } catch (e) {
        return response(res, e.message, {}, 500, false)
      }
    }
  },
  signUpWithPhoneNumber: (req, res) => {
    multerHelper(req, res, async function (err) {
      const { username, password, phone_number } = req.body
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.file.length === 0) {
          fs.unlinkSync('assets/uploads/' + req.file.filename)
          return response(res, 'fieldname doesnt match', {}, 500, false)
        }
        // fs.unlinkSync('assets/uploads' + req.file)
        return response(res, err.message, {}, 500, false)
      } else if (err) {
        fs.unlinkSync('assets/uploads/' + req.file.filename)
        return response(res, err.message, {}, 401, false)
      }
      try {
        if (phone_number) {
          const encryptPassword = await bcrypt.hash(password, await bcrypt.genSalt())
          if (req.file) {
            const picture = `uploads/${req.file.filename}`
            const data = {
              username,
              password: encryptPassword,
              phone_number,
              profile_image: picture
            }
            const isExist = await User.findOne({ where: { phone_number } })
            // console.log(isExist === null)
            if (isExist) {
              fs.unlinkSync('assets/uploads/' + req.file.filename)
              return response(res, 'Error phone number has been registered, please login with it,', {}, 400, false)
            } else {
              console.log(data)
              const results = await User.create(data)
              return response(res, 'User created successfully', { results })
            }
          } else {
            const data = {
              username,
              password: encryptPassword,
              phone_number
            }
            console.log('hello')
            const isExist = await User.findOne({ where: { phone_number } })
            console.log(isExist)
            if (isExist) {
              return response(res, 'Error phone number has been registered, please login with it,', {}, 400, false)
            } else {
              console.log(data)
              const results = await User.create(data)
              return response(res, 'User created successfully', { results })
            }
          }
        } else {
          // console.log('hello disini')
          return response(res, 'please input phone number', {}, 400, false)
        }
      } catch (e) {
        if (req.file) {
          fs.unlinkSync('assets/uploads/' + req.file.filename)
          return response(res, e.message, {}, 500, false)
        }
      }
    })
  },
  loginWithPhoneNumber: async (req, res) => {
    const schema = joi.object({
      phone_number: joi.string().required(),
      password: joi.string().required(),
      deviceToken: joi.string().required()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return response(res, 'Error', { error: error.message }, 400, false)
    } else {
      const { phone_number, password, deviceToken } = results
      try {
        const isExist = await User.findOne({ where: { phone_number } })
        if (isExist) {
          if (isExist.dataValues.password) {
            try {
              await bcrypt.compare(password, isExist.dataValues.password, (err, result) => {
                if (result) {
                  jwt.sign({ id: isExist.dataValues.id, deviceToken: deviceToken }, APP_KEY, async (err, token) => {
                    try {
                      await isExist.update({ last_active: new Date() })
                    } catch (e) {

                    }
                    return response(res, 'Login succesfully', { token }, 200, true)
                  })
                } else {
                  return response(res, 'Old Password is wrong!', {}, 400, false)
                }
              })
            } catch (e) {
              return response(res, e.message, {}, 500, false)
            }
          }
        } else {
          console.log(isExist)
          return response(res, 'Phone number is\'nt registered', {}, 400, false)
        }
      } catch (e) {
        return response(res, e.message, {}, 500, false)
      }
    }
  },
  getResetCode: async (req, res) => {
    const { email } = req.body
    const isExist = await User.findOne({ where: { email } })
    if (isExist) {
      let resetCode = uuidv4()
      resetCode = resetCode.slice(0, 6)
      const sendResetCode = await isExist.update({ reset_code: resetCode })
      if (sendResetCode) {
        return response(res, 'Reset Code sent successfully', { result: resetCode })
      }
    } else {
      return response(res, 'Email isn\'t registered', {}, 404)
    }
  },
  resetPasswordVerifiyResetCode: async (req, res) => {
    const { reset_code, email } = req.body
    console.log(reset_code)
    const isResetCodeMatch = await User.findOne({
      where: {
        [Op.and]: [
          {
            email: email
          },
          {
            reset_code: reset_code
          }
        ]
      }
    })
    if (isResetCodeMatch) {
      return response(res, 'Reset Code is Same', {})
    } else {
      return response(res, 'Reset Code doesn\'t Same', {}, 400)
    }
  }
}
