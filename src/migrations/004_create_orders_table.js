const { sequelize } = require('../models');
const { DataTypes } = require('sequelize');

const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.createTable('orders', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
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

  // Add indexes
  await queryInterface.addIndex('orders', ['user_id'], {
    name: 'idx_user'
  });
  await queryInterface.addIndex('orders', ['status'], {
    name: 'idx_status'
  });

  console.log('✓ Orders table created');
};

const down = async () => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable('orders');
  console.log('✓ Orders table dropped');
};

module.exports = { up, down };