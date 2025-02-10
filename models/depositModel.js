import {db} from "../database.js";

// Create a new deposit entry
export async function createDeposit ({ user_id, amount, screenshot, status }) {
    const query = `
        INSERT INTO deposits (user_id, amount, screenshot, status, created_at)
        VALUES ($1, $2, $3, $4, NOW()) RETURNING *;
    `;
    const values = [user_id, amount, screenshot, status];

    const { rows } = await db.query(query, values);
    return rows[0]; // Return the inserted deposit record
};

// Fetch all deposit transactions (for admin)
export async function getAllDeposits () {
    const query = `SELECT * FROM deposits ORDER BY created_at DESC`;
    const { rows } = await db.query(query);
    return rows;
};

// Fetch deposits for a specific user
export async function getUserDeposits (user_id) {
    const query = `SELECT * FROM deposits WHERE user_id = $1 ORDER BY created_at DESC`;
    const { rows } = await db.query(query, [user_id]);
    return rows;
};

export async function updateUserBalance(user_id, amount) {
    const query = `
        UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance;
    `;
    const { rows } = await db.query(query, [amount, user_id]);
    return rows[0];
}