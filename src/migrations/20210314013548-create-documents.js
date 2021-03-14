'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('documents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama_dokumen: {
        type: Sequelize.STRING
      },
      jenis: {
        type: Sequelize.ENUM('daily', 'monthly')
      },
      divisi: {
        type: Sequelize.STRING
      },
      status_depo: {
        type: Sequelize.STRING
      },
      create_date: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive')
      },
      nama_pic: {
        type: Sequelize.STRING
      },
      kode_depo: {
        type: Sequelize.INTEGER,
        unique: true
      },
      lock_dokumen: {
        type: Sequelize.TINYINT
      },
      alasanId: {
        type: Sequelize.INTEGER
      },
      status_dokumen: {
        type: Sequelize.INTEGER
      },
      path: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('documents')
  }
}
