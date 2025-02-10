import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.JWT_SECRET;
const expiryDate = process.env.JWT_EXPIRE;

export default function generateWebTokens(userId){
    const token = jwt.sign({id: userId}, secretKey, {
        expiresIn: expiryDate
    });
    
    return token
}