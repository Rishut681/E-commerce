const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  method: { type: String, enum: ["COD", "Credit Card", "UPI", "PayPal"] },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  transactionId: String,
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;