const { sequelize } = require('../models');
const { DataTypes } = require('sequelize');

const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.createTable('order_items', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // Add index
  await queryInterface.addIndex('order_items', ['order_id'], {
    name: 'idx_order'
  });

  console.log('✓ Order items table created');
};

const down = async () => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable('order_items');
  console.log('✓ Order items table dropped');
};

module.exports = { up, down };