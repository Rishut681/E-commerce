const validate = (schema) => async (req, res, next) => {
    try {
        const parseBody = await schema.parseAsync(req.body);
        req.body = parseBody;
        next();
    } catch (error) {
        // Check if the error is a ZodError instance
        if (error.errors) { // ZodError objects have an 'errors' property
            const status = 400;

            const structuredErrorResponse = {
                status,
                message: "Fill the input Correctely.",
                extraDetails: error.errors[0].message,
            };

            next(structuredErrorResponse);
        } else {
            // Handle other types of errors (e.g., unexpected server errors)
            console.error(error); // Log unexpected errors for debugging
            const status = 500;
            const message = error.message;

            const errorResponse = {
                status,
                message,
            };

            next(errorResponse);
        }
    }
}; 

module.exports = validate;