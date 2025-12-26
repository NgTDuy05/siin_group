const { Category } = require('../models');

const categories = [
    { name: 'Electronics', description: 'Electronic devices and accessories' },
    { name: 'Clothing', description: 'Fashion and apparel' },
    { name: 'Books', description: 'Books and educational materials' }
];

const seedCategories = async () => {
    try {
        await Category.bulkCreate(categories, {
            ignoreDuplicates: true
        });
        console.log('✓ Categories seeded successfully');
    } catch (error) {
        console.error('Category seeding failed:', error);
        throw error;
    }
};

module.exports = seedCategories;