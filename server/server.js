require('dotenv').config();
const express = require("express");
const app = express();
const authRoute = require("./router/auth-router");
const productRoute = require("./router/product-router");
const contactRoute = require("./router/contact-router");
const cartRoute = require("./router/cart-router");
const orderRoutes = require("./router/order-router");
const connectDB = require("./utils/db");
const errorHandler = require('./middlewares/error-middleware');
const cors = require("cors");

const corsOptions = {
    origin: [
        "https://nexa-ecommerce.vercel.app",
        "https://vercel.com/rishu-rajs-projects-3313f8d7/nexa-ecommerce",
        "http://localhost:5173",
        "http://192.168.30.12:5173"
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    exposedHeaders: 'x-auth-token'
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/form", contactRoute);
app.use("/api", productRoute);
app.use("/api/cart", cartRoute);
app.use('/api/orders', orderRoutes);

app.use(errorHandler);

const PORT = 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`server is running at port: ${PORT}`);
    });
});