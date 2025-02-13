import catchAsyncErrors from "../middleware/catchAsyncError.js";
import * as withdrawalModel from "../models/withdrawalModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { db } from "../database.js";

// Create a new withdrawal request
export const requestWithdrawal = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
        return next(new ErrorHandler("Invalid withdrawal amount", 400));
    }

    // Check if the user has made a withdrawal in the last 24 hours
    const recentWithdrawal = await withdrawalModel.hasRecentWithdrawal(userId);
    if (recentWithdrawal) {
        return next(new ErrorHandler("You can only request a withdrawal once in 24 hours", 400));
    }

    // Check if user has sufficient balance
    const balance = await withdrawalModel.getUserBalance(userId);
    if (amount > balance) {
        return next(new ErrorHandler("Insufficient balance for withdrawal", 400));
    }

    // Create withdrawal request
    const newWithdrawal = await withdrawalModel.createWithdrawal({ user_id: userId, amount });

    res.status(201).json({
        success: true,
        message: "Withdrawal request submitted successfully",
        withdrawal: newWithdrawal,
    });
});

// Approve withdrawal request (Admin Action)
export const approveWithdrawal = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    // Fetch the withdrawal request
    const withdrawal = await withdrawalModel.getWithdrawalById(id);
    if (!withdrawal) {
        return next(new ErrorHandler("Withdrawal request not found", 404));
    }

    if (withdrawal.status !== "pending") {
        return next(new ErrorHandler("This withdrawal has already been processed", 400));
    }

    // Deduct balance from user's account
    await withdrawalModel.deductUserBalance(withdrawal.user_id, withdrawal.amount);

    // Update withdrawal status to approved
    const approvedWithdrawal = await withdrawalModel.approveWithdrawal(id);

    res.status(200).json({
        success: true,
        message: "Withdrawal approved successfully",
        withdrawal: approvedWithdrawal,
    });
});

export const cancelWithdrawal = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    // Fetch the withdrawal request
    const withdrawal = await withdrawalModel.getWithdrawalById(id);
    if (!withdrawal) {
        return next(new ErrorHandler("Withdrawal request not found", 404));
    }

    if (withdrawal.status !== "pending") {
        return next(new ErrorHandler("Only pending withdrawals can be canceled", 400));
    }

    // Cancel withdrawal request
    const canceledWithdrawal = await withdrawalModel.cancelWithdrawal(id);

    res.status(200).json({
        success: true,
        message: "Withdrawal request canceled successfully",
        withdrawal: canceledWithdrawal,
    });
});

export const getAllWithdrawals = catchAsyncErrors(async (req, res, next) => {
    try {
        const query = `SELECT w.*, u.name AS user_name 
            FROM withdrawals w
            JOIN users u ON w.user_id = u.id
            ORDER BY w.created_at DESC`;
        const result = await db.query(query);
        res.status(200).json({ success: true, withdrawals: result.rows });
    } catch (error) {
        console.error(error)
        next(new ErrorHandler("Failed to fetch withdrawals", 500));
    }
});

// ✅ Get withdrawals of a specific user
export const getUserWithdrawals = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = `SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC`;
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return next(new ErrorHandler("No withdrawals found for this user", 404));
        }

        res.status(200).json({ success: true, withdrawals: result.rows });
    } catch (error) {
        console.error(error)
        next(new ErrorHandler("Failed to fetch user withdrawals", 500));
    }
});

// ✅ Get logged-in user's withdrawals
export const getMyWithdrawals = catchAsyncErrors(async (req, res, next) => {
    try {
        const userId = req.user.id; // Assuming user ID is stored in `req.user`
        const query = `SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC`;
        const result = await db.query(query, [userId]);

        if (result.rows.length === 0) {
            return next(new ErrorHandler("No withdrawals found", 404));
        }

        res.status(200).json({ success: true, withdrawals: result.rows });
    } catch (error) {
        next(new ErrorHandler("Failed to fetch withdrawals", 500));
    }
});