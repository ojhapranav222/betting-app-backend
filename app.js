import express from "express";
import cookieParser from "cookie-parser";
import user from "./routes/userRoutes.js";
import bank from "./routes/bankRoutes.js";
import game from "./routes/gameRoutes.js";
import bet from "./routes/betRoutes.js";
import wallet from "./routes/walletRoutes.js";
import deposit from "./routes/depositRoutes.js";
import withdrawal from "./routes/withdrawalRoutes.js";
import errorMiddleware from "./middleware/error.js"
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
  origin: 'http://localhost:5173',
  credentials: true
})); 

app.use("/api/v1/user", user);
app.use("/api/v1/bank", bank);
app.use("/api/v1/game", game);
app.use("/api/v1/bet", bet);
app.use("/api/v1/wallet", wallet);
app.use("/api/v1/deposit", deposit);
app.use("/api/v1/withdrawal", withdrawal);

app.use(errorMiddleware);

export default app;