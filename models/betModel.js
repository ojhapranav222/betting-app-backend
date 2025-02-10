import { db } from "../database.js";
import * as wallet from "./walletModels.js"

export async function createBet(bet){
    const {userId, gameId, team, amount, status} = bet
    try{
        const result = await db.query(`INSERT INTO bets (user_id, game_id, team_choice, amount_bet, status) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [userId, gameId, team, amount, status]);
        return result.rows[0];
    } catch(err){
        console.log(err);
        throw err;
    }
}

export async function getBalanceById(id){
    try{
        const result = await db.query(`SELECT balance FROM users WHERE id = $1`, [id]);
        return result.rows[0];
    } catch(err){
        console.error(err)
        throw err;
    }
}

export async function getBetByUserId(id){
    try{
        const result = await db.query(`SELECT * FROM bets WHERE user_id = $1`, [id])
        return result.rows;
    } catch(err){
        console.error(err)
    }
}

export async function getAllBets(){
    try{
        const result = await db.query(`SELECT * FROM bets`);
        return result.rows;
    } catch(err){
        console.error(err)
    }
}

export async function cancelBet(betId) {
    try {
        // Start a transaction to ensure atomicity
        await db.query("BEGIN");

        // Fetch the bet details
        const betResult = await db.query(
            `SELECT user_id, amount_bet, status FROM bets WHERE id = $1 FOR UPDATE`, 
            [betId]
        );

        if (betResult.rows.length === 0) {
            await db.query("ROLLBACK");
            return { success: false, message: "Bet not found" };
        }

        const { user_id, amount_bet, status } = betResult.rows[0];

        console.log(status);

        if (status !== "approved") {
            await db.query("ROLLBACK");
            return { success: false, message: "Bet cannot be cancelled as it is already processed" };
        }

        // Refund the amount to the user's wallet
        await db.query(
            `UPDATE users SET balance = balance + $1 WHERE id = $2`, 
            [amount_bet, user_id]
        );

        // Log the transaction in wallet_transactions
        await wallet.logTransaction(user_id, amount_bet, "refund", betId);

        // Update bet status to 'cancelled'
        await db.query(
            `UPDATE bets SET status = 'cancelled' WHERE id = $1`, 
            [betId]
        );

        // Commit transaction
        await db.query("COMMIT");

        return { success: true, message: "Bet cancelled successfully, amount refunded" };
    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        throw new Error("Error cancelling the bet");
    }
}