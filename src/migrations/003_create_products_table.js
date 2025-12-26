const { sequelize } = require('../models');
const { DataTypes } = require('sequelize');

const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.createTable('products', {
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      },
      onDelete: 'SET NULL'
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
  await queryInterface.addIndex('products', ['category_id'], {
    name: 'idx_category'
  });
  await queryInterface.addIndex('products', ['price'], {
    name: 'idx_price'
  });

  console.log('✓ Products table created');
};

const down = async () => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable('products');
  console.log('✓ Products table dropped');
};

module.exports = { up, down };