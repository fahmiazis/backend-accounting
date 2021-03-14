'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('emails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kode_area: {
        type: Sequelize.INTEGER,
        unique: true
      },
      nama_depo: {
        type: Sequelize.STRING
      },
      email_bm: {
        type: Sequelize.STRING
      },
      email_aos: {
        type: Sequelize.STRING
      },
      email_sa: {
        type: Sequelize.STRING
      },
      email_ho_1: {
        type: Sequelize.STRING
      },
      email_ho_2: {
        type: Sequelize.STRING
      },
      email_ho_3: {
        type: Sequelize.STRING
      },
      email_ho_4: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive')
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
    await queryInterface.dropTable('emails')
  }
}
