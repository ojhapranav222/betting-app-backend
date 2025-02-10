import cloudinary from "../config/cloudinary.js";
import catchAsyncErrors from "../middleware/catchAsyncError.js";
import * as bankModel from "../models/bankModel.js";
import formidable from "formidable";
import ErrorHandler from "../utils/errorHandler.js";

export const registerBank = catchAsyncErrors(async (req, res, next) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return next(new ErrorHandler("File upload error", 400));
        }

        const { bankName, accountNumber, holderName, ifscCode, upiId } = fields;

        // Check if account or UPI ID already exists
        const existingBank = await bankModel.getBankDetails(accountNumber, upiId);
        if (existingBank) {
            return next(new ErrorHandler("Account Number or UPI ID already exists", 400));
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

        // Store bank details in DB
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