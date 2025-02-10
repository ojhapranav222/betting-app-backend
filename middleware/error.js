import ErrorHandler from "../utils/errorHandler.js";

export default function(err, req, res, next){
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    if (err === "22PO2"){
        const message = `Resource not found ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}