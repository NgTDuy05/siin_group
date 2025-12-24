const seedCategories = require('./categorySeeder');
const seedProducts = require('./productSeeder');

const runSeeders = async () => {
    try {
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