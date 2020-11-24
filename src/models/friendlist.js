'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Friendlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Friendlist.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
      Friendlist.belongsTo(models.User, {
        foreignKey: 'friend_id',
        as: 'friend'
      })
    }
  };
  Friendlist.init({
    user_id: DataTypes.INTEGER,
    friend_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Friendlist'
  })
  return Friendlist
}
