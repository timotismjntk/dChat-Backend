const response = require('../helpers/responseStandard')
const { pagination } = require('../helpers/pagination')
const { Op } = require('sequelize')
const { Message, User } = require('../models')
const multer = require('multer')
const joi = require('joi')
const Sequelize = require('sequelize')

module.exports = {
  getAllMessages: async (req, res) => {
    const { id } = req.user
    const { offset = 0 } = req.query
    const panjang = await Message.findAll({
      where: {
        [Op.or]: [
          {
            recipient_id: id
          }, {
            sender_id: id
          }
        ]
      }
    })
    const page = pagination(req, panjang.length)
    const { pageInfo } = page
    const { limitData } = pageInfo
    const results = await Message.findAll({
      include: [{
        model: User,
        as: 'Recipient',
        attributes: {
          exclude: ['password', 'email', 'phone_number', 'reset_code', 'createdAt', 'updatedAt']
        }
      },
      {
        model: User,
        as: 'Sender',
        attributes: {
          exclude: ['password', 'email', 'phone_number', 'reset_code', 'createdAt', 'updatedAt']
        }
      }
      ],
      where: {
        [Op.or]: [
          {
            recipient_id: id
          }, {
            sender_id: id
          }
        ]
      },
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT CONCAT(SUBSTRING(content, 1, 20), '...')
            )`),
            'content'
          ]
        ],
        exclude: ['content']
      },
      limit: limitData,
      offset: offset,
      order: [
        ['last_sent', 'desc']
      ]
    })
    if (results.length > 0) {
      return response(res, 'List of All Messages', { results, pageInfo })
    } else {
      return response(res, 'You dont have any messages', { results })
    }
  },
  getMessages: async (req, res) => {
    const { id } = req.user
    const { recieptId } = req.params
    const { offset = 0 } = req.query
    const page = pagination(req)
    const { pageInfo } = page
    const { limitData } = pageInfo
    console.log(id)
    const results = await Message.findAll({
      include: [
      //   {
      //   model: User,
      //   as: 'Recipient'
      // },
        {
          model: User,
          as: 'Sender'
        }],
      where: {
        [Op.or]: [
          {
            recipient_id: Number(recieptId),
            sender_id: id
          }, {
            recipient_id: id,
            sender_id: Number(recieptId)
          }
        ]
      },
      order: [
        ['last_sent', 'asc']
      ]
    })
    if (results.length > 0) {
      try {
        await Message.update({ isRead: 1 }, { where: { recipient_id: id } })
        // await results.update({ last_active: new Date().getTime() })
      } catch (e) {
        return response(res, e.message, {}, 400, false)
      }
      const newResults = await Message.findAll({
        include: [
          {
            model: User,
            as: 'Recipient',
            attributes: {
              exclude: ['password', 'email', 'phone_number', 'reset_code', 'createdAt', 'updatedAt']
            }
          },
          {
            model: User,
            as: 'Sender',
            attributes: {
              exclude: ['password', 'email', 'phone_number', 'reset_code', 'createdAt', 'updatedAt']
            }
          }],
        where: {
          recipient_id: id
          // sender_id: id
        },
        order: [
          ['last_sent', 'desc']
        ]
      })
      return response(res, 'Detail Message', { results: newResults })
    } else {
      return response(res, 'It\'s look like you dont have any message', { results })
    }
  },
  postMessage: async (req, res) => {
    const { id } = req.user
    const schema = joi.object({
      recipient_id: joi.number().required(),
      content: joi.string().required()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return response(res, 'Error', { error: error.message }, 400, false)
    } else {
      const { content, recipient_id } = results
      try {
        const data = {
          sender_id: id,
          recipient_id,
          content,
          isRead: 0,
          last_sent: new Date().getTime()
        }
        const post = await Message.create(data)
        return response(res, 'Message sended successfully', { post })
      } catch (error) {
        return response(res, error.message, {}, 500, false)
      }
    }
  },
  editMessage: async (req, res) => {
    const { id } = req.user
    const { msgId } = req.params
    const schema = joi.object({
      senderId: joi.number().required(),
      content: joi.string().required()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return response(res, 'Error', { error: error.message }, 400, false)
    } else {
      const { content, senderId } = results
      try {
        const data = {
          content
        }
        const result = await Message.findOne({ where: { recipient_id: id, sender_id: senderId, id: msgId } })
        if (result === null) {
          return response(res, 'Error message not found', {}, 404, false)
        } else {
          try {
            const makeUpdate = await result.update(data)
            if (makeUpdate) {
              return response(res, 'Message updated successfully', { makeUpdate })
            } else {
              return response(res, 'Failed to update message', { }, 401, false)
            }
          } catch (e) {
            return response(res, e.message, {}, 400, false)
          }
        }
      } catch (e) {
        return response(res, e.message, {}, 500, false)
      }
    }
  },
  deleteMessage: async (req, res) => {
    const { id } = req.user
    const { msgId } = req.params
    const { senderId } = req.body
    try {
      const result = await Message.findOne({ where: { recipient_id: id, sender_id: senderId, id: msgId } })
      if (result === null) {
        return response(res, 'Message not found', {}, 404, false)
      } else {
        await result.destroy()
        return response(res, 'Message deleted successfully', {})
      }
    } catch (e) {
      return response(res, e.message, {}, 500, false)
    }
  }
}
