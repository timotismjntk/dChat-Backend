'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Message.belongsTo(models.User, {
        foreignKey: 'sender_id',
        as: 'From'
      })
      Message.belongsTo(models.User, {
        foreignKey: 'recipient_id',
        as: 'To'
      })
    }
  };
  Message.init({
    sender_id: DataTypes.INTEGER,
    recipient_id: DataTypes.INTEGER,
    content: DataTypes.STRING,
    isRead: DataTypes.BOOLEAN,
    last_sent: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Message'
  })
  return Message
}
