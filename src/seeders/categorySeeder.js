const db = require('../config/database');

const categories = [
    { name: 'Electronics', description: 'Electronic devices and accessories' },
    { name: 'Clothing', description: 'Fashion and apparel' },
    { name: 'Books', description: 'Books and educational materials' }
];

const seedCategories = async () => {
    try {
        for (const category of categories) {
            await db.query(
                'INSERT INTO categories (name, description) VALUES (?, ?)',
                [category.name, category.description]
            );
        }
        console.log('✓ Categories seeded successfully');
    } catch (error) {
        console.error('Category seeding failed:', error);
        throw error;
    }
};

module.exports = seedCategories;