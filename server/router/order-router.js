const express = require("express");
const { createOrder, getUserOrders, getAllOrders } = require("../controllers/order-controller");
const authMiddleware = require("../middlewares/auth-middleware");

const router = express.Router();

// ✅ Create new order (after successful payment)
router.post("/", authMiddleware, createOrder);

// ✅ Get logged-in user's orders
router.get("/my-orders", authMiddleware, getUserOrders);

// ✅ Get all orders (admin only)
router.get("/", authMiddleware, getAllOrders);

module.exports = router;
