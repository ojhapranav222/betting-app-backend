import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "./catchAsyncError.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../database.js";

dotenv.config();

export  const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const {token} = req.cookies;
    if (!token){
        return next(new ErrorHandler("Please login to access this route", 401));
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await db.query(`SELECT * FROM users WHERE id = $1`, [decodedData.id]);
    next();
})

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const role = req.user.rows[0].role;
        if (!roles.includes(role)){
            return next(new ErrorHandler(`Role: ${role} is not authorized to access this resource`, 403));
        }
        next()
    }
}