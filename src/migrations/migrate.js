const { sequelize } = require('../models');
const migration1 = require('./001_create_users_table');
const migration2 = require('./002_create_categories_table');
const migration3 = require('./003_create_products_table');
const migration4 = require('./004_create_orders_table');
const migration5 = require('./005_create_order_items_table');

const migrations = [
    migration1,
    migration2,
    migration3,
    migration4,
    migration5
];

const runMigrations = async () => {
    try {
        console.log('Running migrations with Sequelize...\n');

        // Test connection first
        await sequelize.authenticate();
        console.log('✓ Database connection established\n');

        for (const migration of migrations) {
            await migration.up();
        }

        console.log('\n✓ All migrations completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigrations();