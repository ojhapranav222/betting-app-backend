import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";
import { getAllDeposits, getMyDeposits, newDeposit } from "../controller/depositController.js";

const router = express.Router();

router.route("/add").post(isAuthenticatedUser, newDeposit);
router.route("/all").get(isAuthenticatedUser, authorizeRoles("admin"), getAllDeposits);
router.route("/me").get(isAuthenticatedUser, getMyDeposits);

export default router;