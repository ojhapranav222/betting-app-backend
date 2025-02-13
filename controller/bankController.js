import cloudinary from "../config/cloudinary.js";
import catchAsyncErrors from "../middleware/catchAsyncError.js";
import * as bankModel from "../models/bankModel.js";
import formidable from "formidable";
import ErrorHandler from "../utils/errorHandler.js";
import { db } from "../database.js";

export const registerBank = catchAsyncErrors(async (req, res, next) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return next(new ErrorHandler("File upload error", 400));
        }

        // Extract values properly (avoid storing as JSON strings)
        const bankName = fields.bankName?.[0] || null;
        const accountNumber = fields.accountNumber?.[0] || null;
        const holderName = fields.holderName?.[0] || null;
        const ifscCode = fields.ifscCode?.[0] || null;
        const upiId = fields.upiId?.[0] || null;

        // Check if account number or UPI ID already exists
        if (accountNumber || upiId) {
            const existingBank = await bankModel.getBankDetails(accountNumber, upiId);
            if (existingBank) {
                return next(new ErrorHandler("Account Number or UPI ID already exists", 400));
            }
        }

        let imageUrl = null;

        try {
            if (files.image) {
                const imageFile = files.image[0]; // Ensure file exists
                const uploadResponse = await cloudinary.uploader.upload(imageFile.filepath, {
                    folder: "bank_images",
                });

                imageUrl = uploadResponse.secure_url;
            }
        } catch (error) {
            return next(new ErrorHandler("Error uploading image to Cloudinary", 500));
        }

        // Store bank details in DB with correct format
        const newBank = await bankModel.registerBank({
            image: imageUrl,
            bankName,
            accountNumber,
            holderName,
            ifscCode,
            upiId,
        });

        res.status(201).json({
            success: true,
            message: "Bank registered successfully",
            bank: newBank,
        });
    });
});

export const getAllBanks = catchAsyncErrors(async (req, res, next) => {
    try {
        const banks = await bankModel.getAllBanks();

        res.status(200).json({
            success: true,
            message: "Bank details retrieved successfully",
            banks,
        });
    } catch (err) {
        console.error("Error in getAllBanks:", err);
        return next(err);
    }
});


export const getPrimaryBank = catchAsyncErrors(async(req,res,next) => {
    const bank = await bankModel.getPrimaryBank();
    res.status(200).json({
        success: true,
        message: "Primary bank details retrieved successfully",
        bank
    })
})

export const deleteBank = catchAsyncErrors(async (req, res, next) => {
    const { bank_id } = req.params;

    if (!bank_id) {
        return next(new ErrorHandler("Bank ID is required", 400));
    }

    const deletedBank = await bankModel.deleteBankAccount(bank_id);

    if (!deletedBank) {
        return next(new ErrorHandler("Bank account not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Bank account deleted successfully",
        deletedBank
    });
});

// Edit a bank account (admin action)
export const editBank = catchAsyncErrors(async (req, res, next) => {
    const {id } = req.params;
    const updates = req.body;

    if (!id) {
        return next(new ErrorHandler("Bank ID is required", 400));
    }

    const updatedBank = await bankModel.editBankAccount(id, updates);

    if (!updatedBank) {
        return next(new ErrorHandler("Bank account not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Bank account updated successfully",
        updatedBank
    });
});

export const togglePrimaryBank = catchAsyncErrors(async (req, res, next) => {
    const { bankId } = req.body;

    if (!bankId) {
        return next(new ErrorHandler("Bank ID is required", 400));
    }

    try {
        // Fetch the bank account details
        const bankAccount = await db.query(`SELECT * FROM bank_details WHERE id = $1`, [bankId]);

        if (bankAccount.rows.length === 0) {
            return next(new ErrorHandler("Bank account not found", 404));
        }

        const isPrimary = bankAccount.rows[0].is_primary;

        // If it's not primary, set all accounts to non-primary first, then make this one primary
        await db.query(`UPDATE bank_details SET is_primary = false`);
        await db.query(`UPDATE bank_details SET is_primary = true WHERE id = $1`, [bankId]);

        res.status(200).json({
            success: true,
            message: "Primary bank account updated successfully",
        });
    } catch (error) {
        console.error(error)
        return next(new ErrorHandler("Database error", 500));
    }
});