// backend/router/cart-router.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart-controller');
const authMiddleware = require('../middlewares/auth-middleware'); // Assuming you have an auth middleware

// All cart routes will be protected by authMiddleware
router.use(authMiddleware);

// GET user's cart
router.get('/', cartController.getCart);

// Add item to cart or update quantity
router.post('/', cartController.addItemToCart);

// Update quantity of an item in cart
router.put('/:productId', cartController.updateCartItemQuantity);

// Remove item from cart
router.delete('/:productId', cartController.removeCartItem);

// Clear user's entire cart
router.delete('/', cartController.clearCart); // Note: This route might conflict if not handled carefully with :productId

module.exports = router;
