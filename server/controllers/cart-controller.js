// backend/controllers/cart-controller.js
const Cart = require('../models/cart-model');
const Product = require('../models/product-model'); // To check product existence and get details

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private (User)
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userID }).populate('items.productId', 'name price image'); // Populate product details if needed, though we store some directly

    if (!cart) {
      // If no cart exists for the user, return an empty cart
      return res.status(200).json({ message: "Cart is empty or not found.", cart: { userId: req.userID, items: [] } });
    }
    res.status(200).json({ message: "Cart fetched successfully", cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Add item to cart or update quantity
// @route   POST /api/cart
// @access  Private (User)
const addItemToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.userID;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "Product ID and a positive quantity are required." });
  }

  try {
    // Check if product exists and get its details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    let cart = await Cart.findOne({ userId });

    if (cart) {
      // Cart exists for the user
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

      if (itemIndex > -1) {
        // Product already exists in cart, update quantity
        cart.items[itemIndex].quantity += quantity;
        // Optional: Update price if product price has changed since last add
        cart.items[itemIndex].price = product.price; 
      } else {
        // Product does not exist in cart, add new item
        cart.items.push({
          productId: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
        });
      }
    } else {
      // No cart for user, create a new one
      cart = new Cart({
        userId,
        items: [{
          productId: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
        }],
      });
    }

    await cart.save();
    res.status(200).json({ message: "Item added/updated in cart successfully", cart });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Update quantity of an item in cart
// @route   PUT /api/cart/:productId
// @access  Private (User)
const updateCartItemQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.userID;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: "A positive quantity is required." });
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user." });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.status(200).json({ message: "Cart item quantity updated successfully", cart });
    } else {
      res.status(404).json({ message: "Product not found in cart." });
    }
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private (User)
const removeCartItem = async (req, res) => {
  const { productId } = req.params;
  const userId = req.userID;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user." });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    await cart.save();
    res.status(200).json({ message: "Item removed from cart successfully", cart });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Clear user's cart
// @route   DELETE /api/cart
// @access  Private (User)
const clearCart = async (req, res) => {
  const userId = req.userID;

  try {
    const cart = await Cart.findOneAndDelete({ userId });

    if (!cart) {
      return res.status(200).json({ message: "Cart already empty or not found." });
    }
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
