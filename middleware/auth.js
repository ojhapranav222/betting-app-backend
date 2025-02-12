import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "./catchAsyncError.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../database.js";

dotenv.config();

export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    try {
        let token;

        // ✅ Check Authorization header first
        if (req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        } 
        // ✅ If no header, fallback to cookies
        else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return next(new ErrorHandler("Please login to access this route", 401));
        }

        // ✅ Verify token
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        
        // ✅ Fetch user from DB
        const userResult = await db.query(`SELECT * FROM users WHERE id = $1`, [decodedData.id]);
        
        if (userResult.rows.length === 0) {
            return next(new ErrorHandler("User not found", 404));
        }

        req.user = userResult.rows[0]; // ✅ Store user data in `req.user`
        next(); // ✅ Proceed to the next middleware

    } catch (error) {
        return next(new ErrorHandler("Invalid token or authentication failed", 401));
    }
});

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const role = req.user.role;
        if (!roles.includes(role)){
            return next(new ErrorHandler(`Role: ${role} is not authorized to access this resource`, 403));
        }
        next()
    }
}