const Contact = require("../models/contact-model");

const contactForm = async (req, res) => {
    try {
        const contact = await Contact.create(req.body);
        return res.status(200).json({ message: "message send successfully" });
    } catch (error) {
        const contact_error = {
            status: 500,
            message: error.message,
            extraDetails: "Unexpected Error occured while sending message...",
        }

        next(contact_error);
    }
};

module.exports = contactForm;