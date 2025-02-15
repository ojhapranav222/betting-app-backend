import * as gameModels from "../models/gameModel.js"
import * as walletModels from "../models/walletModels.js"
import {db} from "../database.js"
import catchAsyncErrors from "../middleware/catchAsyncError.js"
import ErrorHandler from "../utils/errorHandler.js"

export const addGame = catchAsyncErrors(async (req, res, next) => {
    try{
        const game = await gameModels.registerGame(req.body);
        if (!game) {
            console.log(game)
            return res.status(500).json({ 
                success: false,
                message: "Could not add game" 
            });
        }
        return res.status(201).json({
            success: true,
            message: "Game added successfully",
            game
        })
    } catch(err){
        console.error(err)
        throw err;
    }
})

export const getAllGames = catchAsyncErrors(async (req, res, next) => {
    try{
        const games = await gameModels.getAllGames();
        if (games.length === 0){
            return res.status(404).json({
                status: "failure",
                message: "No games found"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Games fetched successfully",
            games
        })
    } catch(err){
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
})

export const deleteGamesById = catchAsyncErrors(async (req, res, next) => {
    try{
        const gameId = req.body.id;
        const game = await gameModels.deleteGamesById(gameId);
        if (game.length === 0){
            return res.status(404).json({
                success: false,
                message: "Game not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Game deleted successfully",
            game
        })
    } catch(err){
        console.error(err);
        throw err;
    }
})

export const updateGamesById = catchAsyncErrors(async (req, res, next) => {
    try{
        const {id} = req.params;
        const game = await gameModels.updateGameById(id, req.body);
        if (!game){
            return res.status(404).json({
                success: false,
                message: "Game not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Game updated successfully",
            game
        })
    } catch(err){
        console.error(err);
        return next(new ErrorHandler(err.message, 500))
    }
})

//admin function
export const declareWinner = catchAsyncErrors(async (req, res, next) => {
    const { gameId, winner } = req.body;

    if (!gameId || !["team_a", "team_b", "draw"].includes(winner)) {
        return next(new ErrorHandler("Invalid game ID or winner", 400));
    }

    try {
        await db.query("BEGIN");

        // Update the winner in the games table
        await db.query(`UPDATE games SET winner = $1, bet = false WHERE id = $2`, [winner, gameId]);

        // Fetch all bets placed on the winning team
        const bets = await db.query(
            `SELECT id, user_id, amount_bet FROM bets 
             WHERE game_id = $1 AND team_choice = $2 AND status = 'approved'`,
            [gameId, winner]
        );

        const losingTeam = winner === "team_a" ? "team_b" : winner === "team_b" ? "team_a" : null;

        if (losingTeam) {
            await db.query(
                `UPDATE bets SET status = 'lost' 
                 WHERE game_id = $1 AND team_choice = $2 AND status = 'approved'`,
                [gameId, losingTeam]
            );
        }

        if (bets.rows.length === 0) {
            await db.query("COMMIT");
            return res.status(200).json({
                success: true,
                message: "Winner declared, but no bets were placed on this team.",
            });
        }

        // Process payouts
        for (const bet of bets.rows) {
            const { id: betId, user_id, amount_bet } = bet;

            // Calculate winnings (bet amount + 98% profit)
            const totalWinnings = amount_bet * 1.98; // 98% profit for user
        const adminFee = amount_bet * 0.02; // 2% admin fee

        // Get admin ID dynamically
        const adminQuery = await db.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
        if (adminQuery.rows.length === 0) {
            return next(new ErrorHandler("Admin not found!", 500));
        }
        const adminId = adminQuery.rows[0].id;

        await db.query("BEGIN");

        // Update user balance (add winnings)
        await db.query(`UPDATE users SET balance = balance + $1 WHERE id = $2`, [totalWinnings, user_id]);

        // Update admin balance (collect 2% fee)
        await db.query(`UPDATE users SET balance = balance + $1 WHERE id = $2`, [adminFee, adminId]);

        // Mark bet as won
        await db.query(`UPDATE bets SET status = 'won' WHERE id = $1`, [betId]);

        // Log transaction (user winnings)
        await walletModels.logTransaction(user_id, totalWinnings, "bet_won", betId);

        // Log transaction (admin fee collection)
        await walletModels.logTransaction(adminId, adminFee, "fine", betId);
        }

        await db.query("COMMIT");


        res.status(200).json({
            success: true,
            message: `Winner declared: ${winner}. Payouts processed successfully.`,
        });
    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        return next(new ErrorHandler("Error declaring winner", 500));
    }
});

export const toggleBet = catchAsyncErrors(async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch current bet status
        const { rows } = await db.query(`SELECT bet FROM games WHERE id = $1`, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Game not found" });
        }

        const newBetStatus = !rows[0].bet; // Toggle the betting status

        // Update the bet status in the database
        await db.query(`UPDATE games SET bet = $1 WHERE id = $2`, [newBetStatus, id]);

        res.status(200).json({ 
            success: true, 
            message: `Betting is now ${newBetStatus ? "enabled" : "disabled"}` 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});