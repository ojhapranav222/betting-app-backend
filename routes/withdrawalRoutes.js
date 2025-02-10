import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";
import { approveWithdrawal, cancelWithdrawal, requestWithdrawal } from "../controller/withdrawalController.js";

const router = express.Router();

router.route("/request").post(isAuthenticatedUser, requestWithdrawal);
router.route("/approve/:id").patch(isAuthenticatedUser, authorizeRoles("admin"), approveWithdrawal);
router.route("/reject/:id").patch(isAuthenticatedUser, authorizeRoles("admin"), cancelWithdrawal);

export default router;