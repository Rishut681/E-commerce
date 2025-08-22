const express = require("express");
const { createCheckoutSession, stripeWebhook } = require("../controllers/payment-controller");
const authMiddleware = require("../middlewares/auth-middleware");

const router = express.Router();

// Webhook route → Stripe calls this
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

router.use(express.json());

// Normal checkout route → frontend calls this
router.post("/create-checkout-session", authMiddleware, createCheckoutSession);


module.exports = router;

