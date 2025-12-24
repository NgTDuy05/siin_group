const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const { AppError } = require('../utils/helpers');

// Ensure upload directory exists
if (!fs.existsSync(config.upload.uploadPath)) {
    fs.mkdirSync(config.upload.uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.upload.uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (config.upload.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Only image files are allowed', 400), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.upload.maxFileSize
    }
});

module.exports = upload;