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
        let {matchName, teamA, teamB, endTime, additionalNotes} = updatedData

        let result = await db.query(`UPDATE games SET match_name = $1, team_a = $2, team_b = $3, end_time = $4, additional_notes = $5
                WHERE id = $6 RETURNING *;`, [matchName, teamA, teamB, endTime, additionalNotes, id]);

        return result.rows[0]
    } catch(err){
        console.error(err)
        throw err;
    }
}