const { sequelize } = require('../models');
const { DataTypes } = require('sequelize');

const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.createTable('categories', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  console.log('✓ Categories table created');
};

const down = async () => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable('categories');
  console.log('✓ Categories table dropped');
};

module.exports = { up, down };