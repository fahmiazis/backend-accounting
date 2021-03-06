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
      kode_plant: {
        type: Sequelize.STRING,
        unique: true
      },
      area: {
        type: Sequelize.STRING
      },
      email_aos: {
        type: Sequelize.STRING
      },
      email_ho_pic: {
        type: Sequelize.STRING
      },
      email_bm: {
        type: Sequelize.STRING
      },
      email_grom: {
        type: Sequelize.STRING
      },
      email_rom: {
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
      email_sa: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('emails')
  }
}
