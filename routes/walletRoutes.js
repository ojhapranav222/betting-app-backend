import express from "express";
import { addBonus, deductFine, getAllTransactions } from "../controller/walletController.js";
import {isAuthenticatedUser, authorizeRoles} from "../middleware/auth.js"

const router = express.Router();

// Admin-only route to add bonus to users
router.route("/add").post(isAuthenticatedUser, authorizeRoles("admin"), addBonus);
router.route("/deduct").post(isAuthenticatedUser, authorizeRoles("admin"), deductFine);
router.route("/all").get(isAuthenticatedUser, authorizeRoles("admin"), getAllTransactions);

export default router;