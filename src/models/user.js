'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      User.hasMany(models.Message, {
        foreignKey: 'sender_id'
      })
      User.hasMany(models.Message, {
        foreignKey: 'recipient_id'
      })
    }
  };
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    profile_image: DataTypes.STRING,
    unique_id: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    last_active: DataTypes.DATE,
    reset_code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User'
  })
  return User
}
