import { db } from "../database.js";

// Create a new withdrawal request
export async function createWithdrawal({ user_id, upiId, accountNumber, ifscCode, holderName, bankName, amount }) {
    const query = `
        INSERT INTO withdrawals (user_id, upi_id, account_number, ifsc_code, account_holder_name, bank_name, amount, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW()) RETURNING *;
    `;
    const values = [user_id, upiId, accountNumber, ifscCode, holderName, bankName, amount];

    const { rows } = await db.query(query, values);
    return rows[0]; // Return the inserted withdrawal record
}

// Check if the user has made a withdrawal request in the last 24 hours
export async function hasRecentWithdrawal(user_id) {
    const query = `
        SELECT * FROM withdrawals 
        WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '24 hours';
    `;
    const { rows } = await db.query(query, [user_id]);
    return rows.length > 0; // Returns true if a recent withdrawal exists
}

// Get user's balance
export async function getUserBalance(user_id) {
    const query = `SELECT balance FROM users WHERE id = $1;`;
    const { rows } = await db.query(query, [user_id]);
    console.log(rows[0].balance);
    return rows[0]?.balance || 0;
}

// Deduct balance from user after withdrawal request
export async function deductUserBalance(user_id, amount) {
    const query = `
        UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING balance;
    `;
    const { rows } = await db.query(query, [amount, user_id]);
    return rows[0]; // Returns the updated balance
}

export async function approveWithdrawal(withdrawal_id) {
    const query = `
        UPDATE withdrawals 
        SET status = 'approved'
        WHERE id = $1 AND status = 'pending' 
        RETURNING *;
    `;
    const { rows } = await db.query(query, [withdrawal_id]);

    return rows[0]; // Return the updated withdrawal record
}

export async function cancelWithdrawal(withdrawal_id) {
    const query = `
        UPDATE withdrawals 
        SET status = 'rejected'
        WHERE id = $1 AND status = 'pending' 
        RETURNING *;
    `;
    const { rows } = await db.query(query, [withdrawal_id]);

    return rows[0]; // Return the updated withdrawal record
}

export async function getWithdrawalById(withdrawal_id) {
    const query = `SELECT * FROM withdrawals WHERE id = $1`;
    const { rows } = await db.query(query, [withdrawal_id]);

    return rows[0]; // Return the withdrawal record if found
}