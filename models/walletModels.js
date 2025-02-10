import { db } from "../database.js";

export async function logTransaction(userId, amount, type, betId = null, status = "approved") {
    try {
        const result = await db.query(
            `INSERT INTO wallet_transactions (user_id, amount, transaction_type, bet_id, status, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
            [userId, amount, type, betId, status]
        );
        return result.rows[0];
    } catch (err) {
        console.error("Error logging wallet transaction:", err);
        throw err;
    }
}

export async function updateUserBonus(userId, amount) {
    try {
        const result = await db.query(
            `UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance`,
            [amount, userId]
        );
        return result.rows[0];
    } catch (err) {
        console.error("Error updating user balance:", err);
        throw err;
    }
}

export async function getBalanceById(userId) {
    try {
        const result = await db.query(
            `SELECT balance FROM users WHERE id = $1`,
            [userId]
        );
        return result.rows[0];
    } catch (err) {
        console.error("Error fetching user balance:", err);
        throw err;
    }
}

export async function updateUserFine(userId, amount) {
    try {
        const result = await db.query(
            `UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING balance`,
            [amount, userId]
        );
        return result.rows[0];
    } catch (err) {
        console.error("Error updating user balance:", err);
        throw err;
    }
}