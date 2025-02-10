import express from "express";
import { addBonus, deductFine } from "../controller/walletController.js";
import {isAuthenticatedUser, authorizeRoles} from "../middleware/auth.js"

const router = express.Router();

// Admin-only route to add bonus to users
router.route("/add").post(isAuthenticatedUser, authorizeRoles("admin"), addBonus);
router.route("/deduct").post(isAuthenticatedUser, authorizeRoles("admin"), deductFine);

export default router;