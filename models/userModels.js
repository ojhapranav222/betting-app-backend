import {db} from "../database.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

//registering a user
export async function registerUser(user){
    const {name, email, password, pincode, state, phone} = user;
    try{
        const existingUser = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (existingUser.rows.length > 0){
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(`INSERT INTO users (name, email, password, phone_number, pincode, state) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [name, email, hashedPassword, phone, pincode, state]);
        
        return result.rows[0];
    } catch(err){
        console.error(err);
        throw err;
    }
}

export async function getUserByEmail(email){
    try{
        const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        return result.rows;
    }catch(err){
        console.error(err);
        throw err
    }
}

export async function getUserById(userId){
    try{
        const result = await db.query(`SELECT * FROM users where id = $1`, [userId]);
        return result.rows[0];
    } catch(err){
        console.error(err);
        throw err;
    }
}

export async function getResetPasswordToken(user){
    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Math.floor((Date.now()+ 15*60*1000)/1000);

    try{
        await db.query(`UPDATE users SET reset_password_token = $1, reset_password_expire = to_timestamp($2) WHERE userid = $3`, [user.resetPasswordToken, user.resetPasswordExpire, user.userid]);
    } catch(err){
        console.error("Error creating reset password token:", err);
    }
    return resetToken;
}

export async function clearResetPasswordToken(userId) {
    await db.query(
        `UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE userid = $1`,
        [userId]
    );
}

export async function findUserByResetToken (resetPasswordToken){
    const hashedToken = crypto.createHash("sha256").update(resetPasswordToken).digest("hex");
    const userData = await db.query(
        `SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expire > NOW()`,
        [hashedToken]
    );
    return userData.rows[0];
};

export async function resetUserPassword (userId, newPassword){
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
        `UPDATE users SET passwordhash = $1, reset_password_token = NULL, reset_password_expire = NULL WHERE userid = $2`,
        [hashedPassword, userId]
    );
};

export async function updateUserPassword (newPassword, userId) { 
    try{
        await db.query(`UPDATE users SET passwordhash = $1 WHERE userid = $2`, [newPassword, userId]);
    } catch(err){
        console.error(err);
        throw err;
    }
}

export async function getAllUsers (){
    try{
    const users = await db.query(`SELECT * FROM users`);
    return users.rows;
    } catch(err){
        console.error(err);
    }
}