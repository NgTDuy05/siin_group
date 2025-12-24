const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middlewares/authMiddleware');
const { createProductValidation, updateProductValidation } = require('../middlewares/validation');
const upload = require('../middlewares/upload');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticate, upload.single('image'), createProductValidation, productController.createProduct);
router.put('/:id', authenticate, upload.single('image'), updateProductValidation, productController.updateProduct);
router.delete('/:id', authenticate, productController.deleteProduct);

module.exports = router;