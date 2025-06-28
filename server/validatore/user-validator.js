const { z } = require('zod');

const loginSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .email({ message: "Invalid email address" })
        .trim()
        .min(3, { message: "Email must be at least 3 characters long" })
        .max(30, { message: "Email must be at most 30 characters long" }),
    password: z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(30, { message: "Password must be at most 30 characters long" })
        .trim(),
})

module.exports = { loginSchema };