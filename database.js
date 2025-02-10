import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

export const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: String(process.env.DB_PASSWORD),
    port: process.env.DB_PORT
})

export default async function connectDB(){
    await db.connect();
    console.log(`Database "${process.env.DB_DATABASE}" connected successfully`);
}