// backend/router/product-router.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product-controller');
const categoryController = require('../controllers/category-controller'); // For /api/categories route
const authMiddleware = require('../middlewares/auth-middleware'); // Import your auth middleware
const adminMiddleware = require('../middlewares/admin-middleware'); // NEW: Import admin middleware

// --- Public Routes ---
// GET all products with filtering, searching, sorting, and pagination
router.get('/products', productController.getProducts);

// GET a single product by ID (public access)
router.get('/products/:id', productController.getSingleProduct);

// GET all categories (public access)
router.get('/categories', categoryController.getCategories);


// --- Admin-Only Routes (Protected) ---
// Note: The order of middlewares matters: authMiddleware runs first to set req.user,
// then adminMiddleware checks req.user.isAdmin.

// POST /api/products - Create a new product (Admin only)
router.post('/products', authMiddleware, adminMiddleware, productController.createProduct);

// PUT /api/products/:id - Update an existing product (Admin only)
router.put('/products/:id', authMiddleware, adminMiddleware, productController.updateProduct);

// DELETE /api/products/:id - Delete a product (Admin only)
router.delete('/products/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

module.exports = router;
