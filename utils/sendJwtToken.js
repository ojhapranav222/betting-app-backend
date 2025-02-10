//Creating tokens and saving it in cookies
import dotenv from "dotenv";
import generateWebTokens from "./jwtToken.js";

dotenv.config();
export default function sendToken(user, statusCode, res) {
    const token = generateWebTokens(user.id);
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "Strict",
    }
    res.status(statusCode).cookie('token', token, options).json({ success: true, user, token});
}