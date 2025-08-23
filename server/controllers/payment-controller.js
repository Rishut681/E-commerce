const Stripe = require("stripe");
const Order = require("../models/order-model");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Items are required" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map(item => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      success_url: "https://nexa-ecommerce.vercel.app/success",
      cancel_url: "https://nexa-ecommerce.vercel.app/cancel",
      client_reference_id: req.user ? req.user.id : null,
      metadata: {
        items: JSON.stringify(items),
      },
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Checkout session error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Stripe Webhook
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const order = new Order({
        user: session.client_reference_id,
        orderItems: session.metadata.items
          ? JSON.parse(session.metadata.items)
          : [],
        totalPrice: session.amount_total / 100,
        payment: {
          provider: "stripe",
          intentId: session.payment_intent,
          sessionId: session.id,
          status: session.payment_status === "paid" ? "paid" : "unpaid",
          method: "card",
        },
        status: "paid",
        orderStatus: "Pending",
        paidAt: new Date(),
      });

      await order.save();
      console.log("✅ Order saved:", order._id);
    } catch (err) {
      console.error("Error saving order:", err);
    }
  }

  res.json({ received: true });
};
