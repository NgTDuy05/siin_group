require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 3000;

// Sync database and start server
const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        logger.info('Database connection has been established successfully');

        // Sync models (use { alter: true } in development, avoid in production)
        // await sequelize.sync({ alter: true }); // Uncomment if you want to auto-sync

        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

startServer();