import { db } from "../database.js";

export async function registerGame(game) {
    const { matchName, teamA, teamB, endTime, additionalNotes } = game;

    try {
        const query = `
            INSERT INTO games (match_name, team_a, team_b, end_time, additional_notes) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`;

        const values = [matchName, teamA, teamB, endTime, additionalNotes];

        const result = await db.query(query, values);
        return result.rows[0];

    } catch (err) {
        console.error(err);
    }
}

export async function getAllGames(){
    try{
        const result = await db.query(`SELECT * FROM games ORDER BY end_time DESC`);
        return result.rows;
    } catch(err){
        console.error(err)
    }
}

export async function deleteGamesById(id){
    try{
        const result = await db.query(`DELETE FROM games WHERE id = ANY($1::int[]) RETURNING *`, [id]);
        return result.rows;
    } catch(err){
        console.error(err)
        throw err;
    }
}

export async function getGameById(id){
    try{
        const result = await db.query(`SELECT * FROM games WHERE id = $1`, [id])
        return result.rows[0];
    }catch(err){
        console.error(err)
    }
}

export async function updateGameById(id, updatedData){
    try{
        let {matchName, teamA, teamB, oddsTeamA, oddsTeamB, startTime, isLive, additionalNotes} = updatedData

        let result = null

        if (startTime){
            result = await db.query(`UPDATE games SET match_name = $1, team_a = $2, team_b = $3, odds_team_a = $4, odds_team_b = $5, start_time = $6, is_live = $7, additional_notes = $8
                WHERE id = $9 RETURNING *;`, [matchName, teamA, teamB, oddsTeamA, oddsTeamB, startTime, isLive, additionalNotes, id]);
        } else {
            result = await db.query(`UPDATE games SET match_name = $1, team_a = $2, team_b = $3, odds_team_a = $4, odds_team_b = $5, is_live = $6, additional_notes = $7
                WHERE id = $8 RETURNING *;`, [matchName, teamA, teamB, oddsTeamA, oddsTeamB, isLive, additionalNotes, id]);
        }

        return result.rows[0]
    } catch(err){
        console.error(err)
        throw err;
    }
}