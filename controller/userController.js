import * as userModels from "../models/userModels.js";
import bcrypt from "bcryptjs";
import sendToken from "../utils/sendJwtToken.js";
import catchAsyncErrors from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";

export const registerUser = catchAsyncErrors(async(req, res, next) => {
    const user = await userModels.registerUser(req.body);
    sendToken(user.id, 201, res)
})

export const loginUser = catchAsyncErrors(async(req, res, next) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please fill in all the details"));
    }

    const userData = await userModels.getUserByEmail(email);

    if (userData.length===0){
        return next(new ErrorHandler("Email does not exist"));
    }

    const user = userData[0];
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password"))
    }

    sendToken(user, 200, res);
})

export const logoutUser = catchAsyncErrors(async(req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
})

export const forgotPassword = catchAsyncErrors(async(req, res, next) => {
    const user = await userModels.getUserByEmail(req.body.email);

    if (!user) {
        return next(new ErrorHandler("User not Found", 404));
    }

    const resetToken = await userModels.getResetPasswordToken(user);
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    const message = `Your password reset token is: \n\n ${resetPasswordUrl} \n\n If you did not request this, please ignore this message.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Password Recovery`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.name} successfully.`,
        });
    } catch (err) {
        await userModels.clearResetPasswordToken(user.id);
        return next(new ErrorHandler(err.message, 500));
    }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    const user = await userModels.findUserByResetToken(token);

    if (!user) {
        return next(new ErrorHandler("Your Reset Password token is either invalid or has expired", 400));
    }

    await userModels.resetUserPassword(user.userid, password);

    sendToken(user, 200, res);
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await userModels.getUserById(req.user.rows[0].id);

    res.status(200).json({
        success: true,
        user,
    });
});

export const updateUserPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await userModels.getUserById(req.user.rows[0].userid);
    const {oldPassword, newPassword, confirmPassword} = req.body
    if (!user){
        return next(new ErrorHandler("User not found", 400));
    }

    const isPasswordMatched = await bcrypt.compare(oldPassword, user.passwordhash);

    if (!isPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect", 400))
    }

    if (newPassword !== confirmPassword){
        return next(new ErrorHandler("Password does not match", 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModels.updateUserPassword(hashedPassword, user.userid);
    sendToken(user, 200, res);
})

export const getAllUsers = catchAsyncErrors(async(req, res, next) => {
    const users = await userModels.getAllUsers();
    res.status(200).json({
        success: true,
        users
    })
})