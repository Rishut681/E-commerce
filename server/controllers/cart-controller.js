// backend/controllers/cart-controller.js

const Cart = require('../models/cart-model');
const Product = require('../models/product-model'); // To check product existence and stock
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

// Helper function to calculate total cart amount
const calculateCartTotal = (cart) => {
  let total = 0;
  for (const item of cart.items) {
    // Ensure item.product exists and has a price before adding to total
    // Note: With denormalization, item.price should always be available directly
    if (item.price) { 
      total += item.price * item.quantity;
    }
  }
  return total;
};

// @desc    Get the user's cart
// @route   GET /api/cart
// @access  Private (User)
const getCart = async (req, res) => {
  try {
    const userId = req.userID; // From authMiddleware

    // Populate items.productId to get full product details for display
    let cart = await Cart.findOne({ user: userId }).populate('items.productId');

    if (!cart) {
      // If no cart exists for the user, return an empty cart
      return res.status(200).json({
        message: "Cart is empty.",
        cart: { user: userId, items: [], totalAmount: 0 },
        totalItems: 0,
      });
    }

    // Filter out any items where the referenced product might be null or undefined after population
    // This handles cases where a product might have been deleted from the Product collection
    // and also ensures that only items with complete denormalized data are kept.
    cart.items = cart.items.filter(item => 
      item.productId && item.productId._id && item.name && item.image && item.price
    );

    const totalAmount = calculateCartTotal(cart);

    res.status(200).json({
      message: "Cart fetched successfully.",
      cart: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        totalAmount: totalAmount,
      },
      totalItems: cart.items.length,
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Add a product to the cart or update its quantity
// @route   POST /api/cart
// @access  Private (User)
const addToCart = async (req, res) => {
  try {
    const userId = req.userID;
    const { productId, quantity = 1 } = req.body;

    console.log('addToCart: Received userId:', userId);
    console.log('addToCart: Received productId:', productId, 'quantity:', quantity);

    if (!productId || quantity < 1) {
      return res.status(400).json({ message: "Product ID and a valid quantity (min 1) are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.error('addToCart: Invalid productId format:', productId);
        return res.status(400).json({ message: "Invalid Product ID format." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.error('addToCart: Product not found for ID:', productId);
      return res.status(404).json({ message: "Product not found." });
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Not enough stock for ${product.name}. Available: ${product.stock}` });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      console.log('addToCart: Creating new cart for user:', userId);
      cart = new Cart({ user: userId, items: [] });
    }

    // Find if the product already exists in the cart
    // Use item.productId.toString() because item.productId is an ObjectId
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // Product already in cart, update quantity
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ message: `Cannot add more. Total quantity for ${product.name} would exceed stock. Available: ${product.stock}` });
      }
      cart.items[itemIndex].quantity = newQuantity;
      await cart.save();
      console.log(`addToCart: Quantity for "${product.name}" updated in cart to ${newQuantity}.`);
      res.status(200).json({ message: `Quantity for "${product.name}" updated in cart.`, cart });
    } else {
      // Add new product to cart with denormalized details
      cart.items.push({ 
        productId: product._id,
        name: product.name,
        image: product.image || 'https://placehold.co/100x100/cccccc/333333?text=No+Image', // Provide a fallback image
        price: product.price,
        quantity: quantity 
      });
      await cart.save();
      console.log(`addToCart: "${product.name}" added to cart successfully with quantity ${quantity}.`);
      res.status(201).json({ message: `"${product.name}" added to cart successfully.`, cart });
    }

  } catch (error) {
    console.error('Error adding to cart:');
    console.error('  Error Name:', error.name);
    console.error('  Error Message:', error.message);
    if (error.kind) console.error('  Error Kind:', error.kind);
    if (error.path) console.error('  Error Path:', error.path);
    if (error.value) console.error('  Error Value:', error.value);
    console.error('  Stack Trace:', error.stack);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation Error: " + error.message });
    }
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid ID format provided." });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Update quantity of a specific item in the cart
// @route   PUT /api/cart/:productId
// @access  Private (User)
const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.userID;
    const { productId } = req.params;
    const { quantity } = req.body; // New desired quantity

    if (!productId || quantity === undefined || quantity < 0) {
      return res.status(400).json({ message: "Product ID and a valid quantity (0 or more) are required." });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user." });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(200).json({ message: "Product removed from cart.", cart });
    }

    // Check stock for the new quantity
    const product = await Product.findById(productId);
    if (!product) {
      // If product is no longer in the Product collection, remove it from cart
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(404).json({ message: "Product associated with cart item not found. Item removed." });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: `Cannot update quantity to ${quantity}. Only ${product.stock} available for ${product.name}.` });
    }

    // Update quantity and potentially denormalized fields if they changed (though typically price/name/image don't change often)
    cart.items[itemIndex].quantity = quantity;
    // Optionally update denormalized fields here if needed:
    // cart.items[itemIndex].name = product.name; 
    // cart.items[itemIndex].image = product.image;
    // cart.items[itemIndex].price = product.price;

    await cart.save();

    res.status(200).json({ message: `Quantity for "${product.name}" updated.`, cart });

  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Remove a specific item from the cart
// @route   DELETE /api/cart/:productId
// @access  Private (User)
const removeCartItem = async (req, res) => {
  try {
    const userId = req.userID;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user." });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    await cart.save();
    res.status(200).json({ message: "Product removed from cart successfully.", cart });

  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Clear the entire cart
// @route   DELETE /api/cart
// @access  Private (User)
const clearCart = async (req, res) => {
  try {
    const userId = req.userID;

    const result = await Cart.findOneAndDelete({ user: userId });

    if (!result) {
      return res.status(404).json({ message: "Cart not found for this user." });
    }

    res.status(200).json({ message: "Cart cleared successfully." });

  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
