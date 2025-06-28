const { Schema, model } = require("mongoose");

const contactSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    subject: {
        type: String,
        default: "General Inquiry",
    },
    message: {
        type: String,
        required: true,
    },
}, { timestamps: true } );

const Contact = new model("Contact", contactSchema);
module.exports = Contact;