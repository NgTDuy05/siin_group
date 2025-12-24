module.exports = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        expire: process.env.JWT_EXPIRE || '1h',
        refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d'
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
        uploadPath: process.env.UPLOAD_PATH || './uploads',
        allowedTypes: ['image/jpeg', 'image/png', 'image/jpg']
    }
};