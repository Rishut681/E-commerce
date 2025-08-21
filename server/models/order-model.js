
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
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
});

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderItems: [orderItemSchema],
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentResult: {
            id: String,
            status: String,
            update_time: String,
            email_address: String,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        paymentStatus: {
            type: String,
            required: true,
            default: 'Pending',
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

