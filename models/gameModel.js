import { db } from "../database.js";

export async function registerGame(game){
    let {matchName, teamA, teamB, oddsTeamA, oddsTeamB, startTime, isLive, additionalNotes} = game;
    try{
        let result = null;
        if (startTime){
            isLive = false;
            result = await db.query(`INSERT INTO games (match_name, team_a, team_b, odds_team_a, odds_team_b, start_time, is_live, additional_notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [matchName, teamA, teamB, oddsTeamA, oddsTeamB, startTime, isLive, additionalNotes]);
        } else {
            isLive = true;
            result = await db.query(`INSERT INTO games (match_name, team_a, team_b, odds_team_a, odds_team_b, is_live, additional_notes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [matchName, teamA, teamB, oddsTeamA, oddsTeamB, isLive, additionalNotes]);
        }

        return result.rows[0];
    } catch(err){
        console.error(err)
    }
}

export async function getAllGames(){
    try{
        const result = await db.query(`SELECT * FROM games ORDER BY start_time ASC`);
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