/* eslint-disable camelcase */
const response = require('../helpers/responseStandard')
const { User, Friendlist } = require('../models')
const { Op } = require('sequelize')
const Sequelize = require('sequelize')

module.exports = {
  getPublicContact: async (req, res) => {
    const { id } = req.user
    const { search } = req.query
    let searchValue = []
    const isFriendValue = []

    if (typeof search === 'object') {
      searchValue = Object.values(search)[0]
    } else {
      searchValue = search || ''
    }

    const results = await User.findOne({
      attributes: {
        exclude: ['password', 'email', 'reset_code']
      },
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                username: { [Op.like]: `%${searchValue}%` }
              },
              {
                phone_number: { [Op.like]: `%${searchValue}%` }
              }
            ]
          },
          {
            id: { [Op.not]: id }
          }
        ]
      }
    })
    if (results) {
      const contactId = results.dataValues.id
      console.log(`id nya ${contactId}`)

      const checkIfIsFriend = await Friendlist.findOne({
        where: {
          [Op.or]: [
            {
              user_id: id,
              friend_id: contactId
            },
            {
              user_id: contactId,
              friend_id: id
            }
          ]
        }
      })
      if (checkIfIsFriend) {
        return response(res, 'List of All Public Contact', { results, ...{ isFriend: 1 } })
      }
      return response(res, 'List of All Public Contact', { results, ...{ isFriend: 0 } })
    }
    return response(res, `User with ${searchValue} is not exist`, { results }, 404)
  },
  getAllContact: async (req, res) => {
    const { id } = req.user
    const { search } = req.query
    let searchValue = []
    if (typeof search === 'object') {
      searchValue = Object.values(search)[0]
    } else {
      searchValue = search || ''
    }
    const results = await Friendlist.findAll({
      where: {
        [Op.or]: [
          {
            user_id: id
          },
          {
            friend_id: id
          }
        ]
      },
      include: [{
        model: User,
        as: 'Friend',
        attributes: {
          exclude: ['password', 'email', 'reset_code']
        },
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  username: { [Op.like]: `%${searchValue}%` }
                },
                {
                  phone_number: { [Op.like]: `%${searchValue}%` }
                }
              ]
            }
          ]
        }
      },
      {
        model: User,
        as: 'Self',
        attributes: {
          exclude: ['password', 'email', 'reset_code']
        }
      }],
      order: [['id', 'DESC']],
      group: ['friend_id']
    })

    if (results.length > 0) {
      return response(res, 'List of All Contact', { results })
    }
    return response(res, 'You don\'t have any contacts', { results })
  },
  getContactById: async (req, res) => {
    const { id } = req.params
    const results = await Friendlist.findByPk(id, {
      attributes: {
        exclude: ['password', 'email', 'reset_code']
      }
    })
    if (results) {
      return response(res, `Detail of contact with id ${id}`, { results })
    }
    return response(res, 'contact not found', { results }, 404, false)
  },
  addContact: async (req, res) => {
    const { contactId } = req.params
    const { id } = req.user
    try {
      if (contactId === id) {
        return response(res, 'you can\'t add yourself', {}, 400, false)
      } else {
        const find = await Friendlist.findOne({
          where: {
            [Op.and]: [
              {
                [Op.or]: [
                  {
                    friend_id: id
                  },
                  {
                    user_id: id
                  }
                ]
              },
              {
                [Op.or]: [
                  {
                    friend_id: contactId
                  },
                  {
                    user_id: contactId
                  }
                ]
              }
            ]
          }
        })
        console.log(find)
        if (find) {
          return response(res, 'contact already added', {}, 400, false)
        } else {
          const data = {
            user_id: id,
            friend_id: Number(contactId)
          }
          const added = await Friendlist.create(data)
          return response(res, 'contact added as friend successfully', { added })
        }
      }
    } catch (err) {
      return response(res, err.message, {}, 500, false)
    }
  }
}
