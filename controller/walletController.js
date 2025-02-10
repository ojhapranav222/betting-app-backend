import * as walletModels from "../models/walletModels.js";
import catchAsyncErrors  from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { db } from "../database.js";

export const addBonus = catchAsyncErrors(async (req, res, next) => {
    const { userId, amount } = req.body;

    if (!userId || !amount || amount <= 0) {
        return next(new ErrorHandler("Invalid user ID or amount", 400));
    }

    try {
        await db.query("BEGIN");

        // Update user balance
        const updatedBalance = await walletModels.updateUserBalance(userId, amount);

        // Log the transaction under "bonus"
        await walletModels.logTransaction(userId, amount, "bonus");

        await db.query("COMMIT");

        res.status(200).json({
            success: true,
            message: "Bonus added successfully",
            balance: updatedBalance.balance,
        });
    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        return next(new ErrorHandler("Error adding bonus", 500));
    }
});

export const deductFine = catchAsyncErrors(async (req, res, next) => {
    const { userId, amount } = req.body;

    if (!userId || !amount || amount <= 0) {
        return next(new ErrorHandler("Invalid user ID or amount", 400));
    }

    try {
        await db.query("BEGIN");

        // Fetch the user's current balance
        const { balance } = await walletModels.getBalanceById(userId);

        // Check if fine is greater than balance
        if (amount > balance) {
            await db.query("ROLLBACK");
            return next(new ErrorHandler("Fine amount exceeds available balance", 400));
        }

        // Deduct fine from user's balance
        const updatedBalance = await walletModels.updateUserFine(userId, amount);

        // Log the transaction under "fine"
        await walletModels.logTransaction(userId, amount, "fine");

        await db.query("COMMIT");

        res.status(200).json({
            success: true,
            message: "Fine deducted successfully",
            balance: updatedBalance.balance,
        });
    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        return next(new ErrorHandler("Error deducting fine", 500));
    }
});