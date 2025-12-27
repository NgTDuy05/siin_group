const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middlewares/authMiddleware');
const { createCategoryValidation, updateCategoryValidation } = require('../middlewares/validation');

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', authenticate, createCategoryValidation, categoryController.createCategory);
router.put('/:id', authenticate, updateCategoryValidation, categoryController.updateCategory);
router.delete('/:id', authenticate, categoryController.deleteCategory);

module.exports = router;
