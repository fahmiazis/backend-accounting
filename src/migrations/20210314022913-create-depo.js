'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('depos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kode_depo: {
        type: Sequelize.INTEGER,
        unique: true
      },
      nama_depo: {
        type: Sequelize.STRING
      },
      home_town: {
        type: Sequelize.STRING
      },
      channel: {
        type: Sequelize.STRING
      },
      distribution: {
        type: Sequelize.STRING
      },
      status_depo: {
        type: Sequelize.STRING
      },
      kode_sap_1: {
        type: Sequelize.STRING,
        unique: true
      },
      kode_sap_2: {
        type: Sequelize.STRING,
        unique: true
      },
      kode_plant: {
        type: Sequelize.STRING,
        unique: true
      },
      nama_grom: {
        type: Sequelize.STRING
      },
      nama_bm: {
        type: Sequelize.STRING
      },
      nama_ass: {
        type: Sequelize.STRING
      },
      nama_pic_1: {
        type: Sequelize.STRING
      },
      nama_pic_2: {
        type: Sequelize.STRING
      },
      nama_pic_3: {
        type: Sequelize.STRING
      },
      nama_pic_4: {
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
    await queryInterface.dropTable('depos')
  }
}
