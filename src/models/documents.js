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
    kode_dokumen: DataTypes.STRING,
    nama_dokumen: DataTypes.STRING,
    jenis_dokumen: DataTypes.ENUM('daily', 'monthly'),
    divisi: DataTypes.STRING,
    status_depo: DataTypes.STRING,
    status: DataTypes.ENUM('active', 'inactive'),
    kode_depo: DataTypes.INTEGER,
    lock_dokumen: DataTypes.TINYINT,
    alasan: DataTypes.STRING,
    status_dokumen: DataTypes.INTEGER,
    path: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'documents'
  })
  return documents
}
