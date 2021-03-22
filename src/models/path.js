'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Path extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Path.init({
    dokumenId: DataTypes.INTEGER,
    path: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Path',
  });
  return Path;
};