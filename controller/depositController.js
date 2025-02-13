import cloudinary from "../config/cloudinary.js";
import catchAsyncErrors from "../middleware/catchAsyncError.js";
import * as depositModel from "../models/depositModel.js";
import formidable from "formidable";
import ErrorHandler from "../utils/errorHandler.js";

export const newDeposit = catchAsyncErrors(async (req, res, next) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return next(new ErrorHandler("File upload error", 400));
        }

        const userId = req.user.id;
        let { amount } = fields;
        amount = parseInt(amount, 10);

        if (!amount) {
            return next(new ErrorHandler("Amount is required", 400));
        }

        let screenshotUrl = null;

        try {
            if (!files.screenshot) {
                return next(new ErrorHandler("Screenshot is required", 400));
            }

            const screenshotFile = files.screenshot[0];
            const uploadResponse = await cloudinary.uploader.upload(screenshotFile.filepath, {
                folder: "deposit_screenshots",
            });

            screenshotUrl = uploadResponse.secure_url;
        } catch (error) {
            console.log(error);
            return next(new ErrorHandler("Error uploading screenshot", 500));
        }

        // Save deposit entry
        const newDeposit = await depositModel.createDeposit({
            user_id: userId,
            amount,
            screenshot: screenshotUrl,
            status: "approved",
        });

        // Update user balance in users table
        await depositModel.updateUserBalance(userId, amount);

        res.status(201).json({
            success: true,
            message: "Deposit successful",
            deposit: newDeposit,
        });
    });
});

export const getAllDeposits = catchAsyncErrors(async (req, res, next) => {
    const deposits = await depositModel.getAllDeposits();
    res.status(200).json({
        success: true,
        deposits,
    });
});

export const getMyDeposits = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;
    if (!userId) {
        return next(new ErrorHandler("User not found", 404));
    }
    const deposits = await depositModel.getUserDeposits(userId);

    res.status(200).json({
        success: true,
        deposits,
    })
})

export const getSingleDeposit = catchAsyncErrors(async (req, res, next) => {
    try {
        const userId = req.params.id;

        // Ensure userId is valid
        if (!userId || isNaN(userId)) {
            return next(new ErrorHandler("Invalid or missing user ID", 400));
        }

        // Fetch deposits for the given user
        const deposits = await depositModel.getDepositsByUserId(userId);

        res.status(200).json({
            success: true,
            deposits
        });

    } catch (err) {
        console.error("Error fetching deposits:", err);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
})