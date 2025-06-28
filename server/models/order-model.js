const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  shippingAddress: { type: String },
  paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;