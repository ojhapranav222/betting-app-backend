import { db } from "../database.js";
import catchAsyncErrors from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import * as betModels from "../models/betModel.js";
import * as wallet from "../models/walletModels.js";

export const createBet = catchAsyncErrors(async (req, res, next) => {
    const { gameId, team, amount } = req.body;
    const userId = req.user.id;

    if (!gameId || !team || !amount) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    // Fetch game details
    const gameCheck = await db.query(`SELECT team_a, team_b FROM games WHERE id = $1`, [gameId]);

    if (gameCheck.rows.length === 0) {
        return next(new ErrorHandler("Game not found!", 404));
    }

    const { team_a, team_b } = gameCheck.rows[0];

    // Validate the team
    if (team !== "team_a" && team !== "team_b") {
        return next(new ErrorHandler("Invalid team selection! Choose 'team_a' or 'team_b'", 400));
    }

    // Get user's balance
    const { balance } = await betModels.getBalanceById(userId);
    if (balance < amount) {
        return next(new ErrorHandler("Insufficient balance", 400));
    }

    try {
        await db.query("BEGIN");

        // Deduct amount from balance
        await db.query(`UPDATE users SET balance = balance - $1 WHERE id = $2`, [amount, userId]);

        // Store only "team_a" or "team_b"
        const bet = await betModels.createBet({ userId, gameId, team, amount, status: "approved" });

        // Log the transaction
        await wallet.logTransaction(userId, amount, "bet_placed", bet.id);

        await db.query("COMMIT");

        res.status(201).json({
            success: true,
            message: `Bet placed successfully on ${team}`,
            bet
        });
    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        return next(new ErrorHandler("Error placing bet", 500));
    }
});

export const getMyBets = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;
    const bets = await db.query(`SELECT 
            bets.*, 
            users.name AS user_name, 
            games.match_name, 
            games.team_a, 
            games.team_b, 
            CASE 
                WHEN bets.team_choice = 'team_a' THEN games.team_a 
                WHEN bets.team_choice = 'team_b' THEN games.team_b 
            END AS team_name
        FROM bets
        JOIN users ON bets.user_id = users.id
        JOIN games ON bets.game_id = games.id
        WHERE bets.user_id = $1`, [userId])

    if (bets.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No bets found"
        })
    }

    return res.status(200).json({
        success: true,
        message: "Bets retrieved successfully",
        bets: bets.rows
    })
})

export const cancelBet = catchAsyncErrors(async (req, res, next) => {
    const { betId } = req.params;

    const result = await betModels.cancelBet(betId);

    if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
    }

    res.status(200).json({ success: true, message: result.message });
});

export const getAllBets = catchAsyncErrors(async (req, res, next) => {
    const bets = await betModels.getAllBets();
    if (bets.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No bets found"
        })
    }

    return res.status(200).json({
        success: true,
        message: "Bets retrieved successfully",
        bets
    })
})