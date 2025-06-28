
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "ERROR IN LOADING FROM BACKEND";
    const extraDetails = err.extraDetails || "Unexpected Error...";

    return res.status(status).json({message, extraDetails});

};

module.exports = errorHandler;