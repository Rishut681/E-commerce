const mongoose = require("mongoose");


const URI = process.env.MONGODB_URI;
const connectDB = async () => {
    try {
        await mongoose.connect(URI);
        console.log("DB connected");
    } catch (error) {
        console.log("Connection error", error);
        process.exit(0);
    }
};
module.exports = connectDB;