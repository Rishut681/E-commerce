const Order = require("../models/order-model");

// ✅ Create new order after payment
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentInfo } = req.body;

    const order = new Order({
      user: req.userID, // comes from authMiddleware
      items,
      totalAmount,
      paymentInfo,
      status: "Processing",
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

// ✅ Get logged-in user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userID }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// ✅ Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const orders = await Order.find().populate("user", "name email");
    res.json({ orders });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
};

