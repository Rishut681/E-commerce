// backend/models/cart-model.js
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to the Product model
    required: true,
  },
  name: { // Store name and image for easier display without extra product lookup
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: { // Store price at the time of adding to cart
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1, // Quantity must be at least 1
  },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    unique: true, // Each user has only one cart
  },
  items: [cartItemSchema], // Array of cart items
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
