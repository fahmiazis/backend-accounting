'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class depo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  depo.init({
    kode_depo: DataTypes.INTEGER,
    nama_depo: DataTypes.STRING,
    home_town: DataTypes.STRING,
    channel: DataTypes.STRING,
    distribution: DataTypes.STRING,
    status_depo: DataTypes.STRING,
    kode_sap_1: DataTypes.STRING,
    kode_sap_2: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    nama_grom: DataTypes.STRING,
    nama_bm: DataTypes.STRING,
    nama_ass: DataTypes.STRING,
    nama_pic_1: DataTypes.STRING,
    nama_pic_2: DataTypes.STRING,
    nama_pic_3: DataTypes.STRING,
    nama_pic_4: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'depo'
  })
  return depo
}
