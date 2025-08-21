// server/controllers/orderController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/order-model');
const Cart = require('../models/cart-model');
const Product = require('../models/product-model'); // We need this to check stock

// @desc    Create a Stripe checkout session from cart items
// @route   POST /api/orders/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Check if any item is out of stock before creating the session
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}.` });
      }
    }

    // Map cart items to Stripe's format
    const line_items = cart.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.productId.name,
          images: item.productId.images.length > 0 ? [item.productId.images[0].url] : ['https://placehold.co/100x100/cccccc/333333?text=No+Image'],
        },
        unit_amount: Math.round(item.productId.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/checkout`,
      customer_email: req.user.email,
    });

    res.status(200).json({ sessionId: session.id });

  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ message: 'Server error. Could not create checkout session.' });
  }
};


// @desc    Finalize order and update stock after successful payment
// @route   POST /api/orders/place-order
// @access  Private
const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not successful.' });
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Check if products in cart are still in stock before finalizing
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}.` });
      }
    }

    // Prepare items for the order
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      name: item.productId.name,
      image: item.productId.images.length > 0 ? item.productId.images[0].url : 'https://placehold.co/100x100/cccccc/333333?text=No+Image',
      price: item.productId.price,
      quantity: item.quantity,
    }));

    // Create the new order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      shippingAddress,
      status: 'Processing', // Set initial status to Processing
    });

    await order.save();

    // Decrease stock count for each item and clear the cart
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity },
      });
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json({
      message: 'Order placed successfully.',
      orderId: order._id,
    });

  } catch (error) {
    console.error('Error finalizing order:', error);
    res.status(500).json({ message: 'Server error. Could not place order.' });
  }
};


// @desc    Get user's all orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ orderedAt: -1 });

    res.status(200).json({
      message: 'Orders fetched successfully.',
      orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error. Could not retrieve orders.' });
  }
};

module.exports = {
  createCheckoutSession,
  placeOrder,
  getUserOrders,
};

