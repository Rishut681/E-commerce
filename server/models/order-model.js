
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderItems: [orderItemSchema],
        shippingAddress: {
            name: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
            phone: { type: String, required: true },
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        payment: {
            provider: { type: String, default: "stripe" },
            intentId: String,   // payment_intent id
            sessionId: String,  // checkout session id
            status: { type: String, default: "unpaid" }, // unpaid|paid|failed|refunded
            method: String,     // e.g., "card"
            receiptUrl: String,
        },
        status: {
            type: String,
            enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "failed"],
            default: "pending",
        },
        orderStatus: {
            type: String,
            required: true,
            default: 'Pending',
            enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        },
        paidAt: {
            type: Date,
        },
        deliveredAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
