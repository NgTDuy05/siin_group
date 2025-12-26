const { sequelize } = require('../models');
const seedCategories = require('./categorySeeder');
const seedProducts = require('./productSeeder');

const runSeeders = async () => {
    try {
        console.log('Testing database connection...');
        await sequelize.authenticate();
        console.log('✓ Database connection established\n');

        console.log('Running seeders...');
        await seedCategories();
        await seedProducts();
        console.log('\n✓ All seeders completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

runSeeders();