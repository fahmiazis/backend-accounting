'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class documents extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  documents.init({
    nama_dokumen: DataTypes.STRING,
    jenis: DataTypes.ENUM('daily', 'monthly'),
    divisi: DataTypes.STRING,
    status_depo: DataTypes.STRING,
    create_date: DataTypes.DATE,
    status: DataTypes.ENUM('active', 'inactive'),
    nama_pic: DataTypes.STRING,
    kode_depo: DataTypes.INTEGER,
    lock_dokumen: DataTypes.TINYINT,
    alasanId: DataTypes.INTEGER,
    status_dokumen: DataTypes.INTEGER,
    path: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'documents'
  })
  return documents
};
