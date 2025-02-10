import catchAsyncErrors from "../middleware/catchAsyncError.js";
import * as withdrawalModel from "../models/withdrawalModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// Create a new withdrawal request
export const requestWithdrawal = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.rows[0].id;
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
