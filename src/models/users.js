'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  users.init({
    username: DataTypes.STRING,
    kode_depo: DataTypes.INTEGER,
    nama_depo: DataTypes.STRING,
    user_level: DataTypes.INTEGER,
    status: DataTypes.ENUM('active', 'inactive'),
    password: DataTypes.STRING,
    phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'users'
  })
  return users
}
