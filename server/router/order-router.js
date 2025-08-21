// server/routes/orderRoute.js
const express = require('express');
const { createCheckoutSession, placeOrder, getUserOrders } = require('../controllers/order-controller');
const isAuthenticated = require("../middlewares/auth-middleware");

const router = express.Router();

router.post('/create-checkout-session', isAuthenticated, createCheckoutSession);
router.post('/place-order', isAuthenticated, placeOrder);
router.get('/', isAuthenticated, getUserOrders);

module.exports = router;
