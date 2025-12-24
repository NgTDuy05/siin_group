const db = require('../config/database');

const products = [
    { name: 'Laptop Dell XPS 13', description: 'High-performance ultrabook', price: 1299.99, stock: 15, category_id: 1 },
    { name: 'iPhone 15 Pro', description: 'Latest Apple smartphone', price: 999.99, stock: 25, category_id: 1 },
    { name: 'Sony Headphones WH-1000XM5', description: 'Noise-cancelling headphones', price: 399.99, stock: 30, category_id: 1 },
    { name: 'Samsung 4K TV 55"', description: 'Smart TV with HDR', price: 799.99, stock: 10, category_id: 1 },
    { name: 'Men\'s Casual Shirt', description: 'Cotton blend comfortable shirt', price: 29.99, stock: 100, category_id: 2 },
    { name: 'Women\'s Jeans', description: 'Slim fit denim jeans', price: 49.99, stock: 75, category_id: 2 },
    { name: 'Winter Jacket', description: 'Warm and stylish winter coat', price: 89.99, stock: 40, category_id: 2 },
    { name: 'Clean Code by Robert Martin', description: 'Programming best practices', price: 35.99, stock: 50, category_id: 3 },
    { name: 'The Pragmatic Programmer', description: 'Software craftsmanship guide', price: 42.99, stock: 45, category_id: 3 },
    { name: 'Design Patterns', description: 'Gang of Four classic book', price: 54.99, stock: 30, category_id: 3 }
];

const seedProducts = async () => {
    try {
        for (const product of products) {
            await db.query(
                'INSERT INTO products (name, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?)',
                [product.name, product.description, product.price, product.stock, product.category_id]
            );
        }
        console.log('✓ Products seeded successfully');
    } catch (error) {
        console.error('Product seeding failed:', error);
        throw error;
    }
};

module.exports = seedProducts;