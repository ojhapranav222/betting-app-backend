import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./database.js";

process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to 'unhandled exception'");
    process.exit(1);
})

dotenv.config();
const port = process.env.PORT;

connectDB();

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})


process.on("unhandledRejection", (err) => {

    if (err instanceof AggregateError) {
        err.errors.forEach((e, index) => {
            console.error(`Error ${index + 1}:`, e);
        });
    }
    console.log(`Error: ${err}`);
    console.log("Shutting down the server");

    server.close(() => {
        process.exit(1);
    })
})