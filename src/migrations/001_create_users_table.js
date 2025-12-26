const { sequelize } = require('../models');
const { DataTypes } = require('sequelize');

const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    refresh_token: {
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

  console.log('✓ Users table created');
};

const down = async () => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable('users');
  console.log('✓ Users table dropped');
};

module.exports = { up, down };