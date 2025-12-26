const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Define relationships

// Category - Product relationship (One-to-Many)
Category.hasMany(Product, {
    foreignKey: 'category_id',
    as: 'products',
    onDelete: 'SET NULL'
});
Product.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
});

// User - Order relationship (One-to-Many)
User.hasMany(Order, {
    foreignKey: 'user_id',
    as: 'orders',
    onDelete: 'CASCADE'
});
Order.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// Order - OrderItem relationship (One-to-Many)
Order.hasMany(OrderItem, {
    foreignKey: 'order_id',
    as: 'items',
    onDelete: 'CASCADE'
});
OrderItem.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
});

// Product - OrderItem relationship (One-to-Many)
Product.hasMany(OrderItem, {
    foreignKey: 'product_id',
    as: 'orderItems',
    onDelete: 'CASCADE'
});
OrderItem.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
});

// Many-to-Many relationship between Order and Product through OrderItem
Order.belongsToMany(Product, {
    through: OrderItem,
    foreignKey: 'order_id',
    otherKey: 'product_id',
    as: 'products'
});
Product.belongsToMany(Order, {
    through: OrderItem,
    foreignKey: 'product_id',
    otherKey: 'order_id',
    as: 'orders'
});

module.exports = {
    sequelize,
    User,
    Category,
    Product,
    Order,
    OrderItem
};
