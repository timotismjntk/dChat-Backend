const response = require('../helpers/responseStandard')
const multer = require('multer')
const multerHelper = require('../helpers/uploadHelper')
const { User } = require('../models')
const fs = require('fs')

module.exports = {
  updateAvatar: (req, res) => {
    const { id } = req.user
    multerHelper(req, res, async function (err) {
      try {
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
        const picture = `uploads/${req.file.filename}`
        const data = {
          profile_image: picture
        }
        const results = await User.findByPk(id)
        try {
          await results.update(data)
          return response(res, 'Avatar has been Upload successfully', data)
        } catch (err) {
          fs.unlinkSync('assets/uploads/' + req.file.filename)
          return response(res, err.message, {}, 400, false)
        }
      } catch (e) {
        // fs.unlinkSync('assets/uploads' + req.file.filename)
        return response(res, e.message, {}, 401, false)
      }
    })
  }
}
