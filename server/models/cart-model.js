// backend/models/cart-model.js
const mongoose = require('mongoose');

// Define the schema for individual items within the cart
const cartItemSchema = new mongoose.Schema({
  // Reference to the Product model
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  // Denormalized product details for easier display and to prevent issues if product is deleted
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1.'], // Ensure quantity is at least 1
  },
}, { _id: false }); // Do not create an _id for subdocuments, use productId as logical ID

// Define the main Cart schema
const cartSchema = new mongoose.Schema({
  // Reference to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Each user can only have one cart
  },
  items: [cartItemSchema], // Array of cart items
}, { timestamps: true }); // Add createdAt and updatedAt timestamps

// Create the Cart model
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
