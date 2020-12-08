/* eslint-disable camelcase */
/* eslint-disable no-undef */
const response = require('../helpers/responseStandard')
const qs = require('querystring')
const {
  APP_URL,
  APP_PORT
} = process.env
const { Op } = require('sequelize')
const { Message, User } = require('../models')
const multer = require('multer')
const joi = require('joi')
const Sequelize = require('sequelize')
const messaging = require('../helpers/firebaseAdmin')
const io = require('../App')

module.exports = {
  getAllMessages: async (req, res) => {
    const { id } = req.user
    let { search, orderBy, limit = 10, page = 1 } = req.query
    limit = Number(limit)
    page = Number(page)
    if (page < 1) {
      page = 1
    }
    const pageInfo = {
      currentPage: page,
      totalPage: 0,
      totalData: 2,
      limitData: limit,
      prevLink: null,
      nextLink: null
    }

    const count = await Message.count({
      where: {
        [Op.or]: {
          sender_id: id,
          recipient_id: id
        },
        isLatest: 1
      }
    })
    pageInfo.totalData = count
    pageInfo.totalPage = Math.ceil(count / limit)
    const path = req.originalUrl.slice(1).split('?')[0]
    const prev = qs.stringify({ ...req.query, ...{ page: page - 1 } })
    const next = qs.stringify({ ...req.query, ...{ page: page + 1 } })
    pageInfo.prevLink = page > 1 ? `${APP_URL}:${APP_PORT}/${path}?${prev}` : null
    pageInfo.nextLink = page < pageInfo.totalPage ? `${APP_URL}:${APP_PORT}/${path}?${next}` : null
    let message = {}
    try {
      message = await Message.findAll({
        include: [
          {
            model: User,
            as: 'To',
            attributes: {
              exclude: ['password', 'reset_code', 'createdAt', 'updatedAt']
            }
          },
          {
            model: User,
            as: 'From',
            attributes: {
              exclude: ['password', 'reset_code', 'createdAt', 'updatedAt']
            }
          }
        ],
        attributes: {
          include: [
            [
              Sequelize.literal(`(
              IF(LENGTH(content) > 28, CONCAT(SUBSTRING(content, 1, 28), "..."), content) 
            )`),
              'chat'
            ],
            [
              Sequelize.literal(`(
                SELECT CASE when sender_id = ${id} THEN 'true' ELSE 'false' END
              )`),
              'isSendByUser'
            ]
            // [
            //   Sequelize.literal(`(
            //     SELECT SUM(isRead=0) WHERE recipient_id = ${id} GROUP BY sender_id
            //   )`),
            //   'messageUnread'
            // ]
          ],
          exclude: ['content']
        },
        where: {
          [Op.or]: {
            sender_id: id,
            recipient_id: id
          },
          isLatest: 1
        },
        // group: ['sender_id'],
        limit: limit,
        offset: (page - 1) * limit,
        order: [['last_sent', 'DESC']]
      })
    } catch (e) {
      return response(res, e.message, {}, 400, false)
    }

    if (message.length > 0) {
      let count = 0
      try {
        count = await Message.count({
          where: {
            [Op.or]: {
              sender_id: id,
              recipient_id: id
            },
            isLatest: 1
          }
        })
      } catch (e) {
        return response(res, e.message, {}, 400, false)
      }
      console.log(message.dataValues)
      return response(res, 'List of All Messages', { results: message, pageInfo })
    } else {
      return response(res, 'You dont have any messages', { results: message })
    }
  },
  getMessages: async (req, res) => {
    const { id } = req.user
    const { recieptId } = req.params
    console.log(`id teman ${recieptId}`)
    let { search, orderBy, limit = 10, page = 1 } = req.query
    limit = Number(limit)
    page = Number(page)
    if (page < 1) {
      page = 1
    }
    const pageInfo = {
      currentPage: page,
      totalPage: 0,
      totalData: 2,
      limitData: limit,
      prevLink: null,
      nextLink: null
    }
    const count = await Message.count({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                sender_id: id
              },
              {
                recipient_id: id
              }
            ]
          },
          {
            [Op.or]: [
              {
                sender_id: recieptId
              },
              {
                recipient_id: recieptId
              }
            ]
          }
        ]
      }
    })
    pageInfo.totalData = count
    pageInfo.totalPage = Math.ceil(count / limit)
    const path = req.originalUrl.slice(1).split('?')[0]
    const prev = qs.stringify({ ...req.query, ...{ page: page - 1 } })
    const next = qs.stringify({ ...req.query, ...{ page: page + 1 } })
    pageInfo.prevLink = page > 1 ? `${APP_URL}:${APP_PORT}/${path}?${prev}` : null
    pageInfo.nextLink = page < pageInfo.totalPage ? `${APP_URL}:${APP_PORT}/${path}?${next}` : null

    let chatMessage = {}
    try {
      chatMessage = await Message.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  sender_id: id
                },
                {
                  recipient_id: id
                }
              ]
            },
            {
              [Op.or]: [
                {
                  sender_id: recieptId
                },
                {
                  recipient_id: recieptId
                }
              ]
            }
          ]
        },
        order: [['last_sent', 'DESC']],
        limit: limit,
        offset: (page - 1) * limit
      })
    } catch (e) {
      return response(res, e.message, {}, 400, false)
    }
    let friendContact = {}
    try {
      friendContact = await User.findByPk(recieptId,
        {
          attributes: {
            exclude: ['password', 'reset_code', 'createdAt', 'updatedAt']
          }
        }
      )
    } catch (e) {
      return response(res, e.message, {}, 400, false)
    }

    if (chatMessage.length) {
      return response(res, 'Detail of Chat Messages', { results: { chatMessage, friendContact }, pageInfo })
    } else {
      return response(res, 'You dont have any messages', { results: { chatMessage, friendContact } })
    }
  },
  postMessage: async (req, res) => {
    const { id: sender_id } = req.user
    const schema = joi.object({
      recipient_id: joi.number().required(),
      content: joi.string().required()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return response(res, 'Error', { error: error.message }, 400, false)
    } else {
      const { content, recipient_id } = results

      await Message.update({ isLatest: 0 }, {
        where: {
          [Op.and]: [
            { [Op.or]: [{ recipient_id: sender_id }, { sender_id: sender_id }] },
            { [Op.or]: [{ recipient_id: recipient_id }, { sender_id: recipient_id }] }
          ]
        }
      })

      try {
        const data = {
          sender_id,
          recipient_id,
          content,
          isRead: 0,
          last_sent: new Date().getTime(),
          isLatest: 1
        }
        io.emit(recipient_id.toString(), { sender_id, content }) // konfigurasi untuk socket io
        const post = await Message.create(data)
        // admin.messaging().send({
        const findSelf = await User.findByPk(sender_id)
        const { id } = findSelf.dataValues
        if (id === sender_id) {
          const recipientResult = await User.findByPk(recipient_id)
          const { deviceToken } = recipientResult.dataValues
          const senderResult = await User.findByPk(sender_id)
          const { username } = senderResult.dataValues
          console.log(senderResult)
          if (deviceToken.length > 0) {
            messaging(deviceToken, username, content)
          }
        } else {
          const senderResult = await User.findByPk(sender_id)
          const { deviceToken } = senderResult.dataValues
          const recipientResult = await User.findByPk(recipient_id)
          const { username } = recipientResult.dataValues
          console.log(recipientResult)
          // helper firebase
          if (deviceToken.length > 0) {
            messaging(deviceToken, username, content)
          }
        }
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
