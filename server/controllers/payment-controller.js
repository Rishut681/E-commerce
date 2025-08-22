const Stripe = require("stripe");
const Order = require("../models/order-model");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session
const createCheckoutSession = async (req, res) => {
  try {
    const { cartItems, userId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.FRONTEND_URL}/order-success`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`,
      client_reference_id: userId, // attach logged-in user
      metadata: {
        items: JSON.stringify(cartItems), // keep cart info for webhook
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
};

// Stripe Webhook (verify with secret)
const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle completed payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const order = new Order({
        user: session.client_reference_id,
        items: session.metadata.items ? JSON.parse(session.metadata.items) : [],
        totalAmount: session.amount_total / 100,
        paymentInfo: {
          id: session.payment_intent,
          status: session.payment_status,
        },
        status: "Processing",
      });

      await order.save();
      console.log("✅ Order saved:", order._id);
    } catch (err) {
      console.error("Error saving order:", err);
    }
  }

  res.json({ received: true });
};

module.exports = { createCheckoutSession, stripeWebhook };
