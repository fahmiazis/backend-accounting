'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  pic.init({
    pic: DataTypes.STRING,
    spv: DataTypes.STRING,
    divisi: DataTypes.STRING,
    kode_depo: DataTypes.INTEGER,
    nama_depo: DataTypes.STRING,
    status: DataTypes.ENUM('active', 'inactive')
  }, {
    sequelize,
    modelName: 'pic',
  });
  return pic;
};