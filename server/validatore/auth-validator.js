const { z } = require('zod');

const signupSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .trim()
        .min(3, { message: "Name must be at least 3 characters long" }),
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
    phone: z
        .string()
        .trim()
        .min(10, { message: "Phone number must be at least 10 characters long" })
        .optional(),
    address: z
        .string()
        .trim()
        .optional(),
    role: z
        .enum(["customer", "admin"])
        .default("customer")
})

module.exports = { signupSchema };