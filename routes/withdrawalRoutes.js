import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";
import { approveWithdrawal, cancelWithdrawal, getAllWithdrawals, getMyWithdrawals, getUserWithdrawals, requestWithdrawal } from "../controller/withdrawalController.js";

const router = express.Router();

router.route("/request").post(isAuthenticatedUser, requestWithdrawal);
router.route("/approve/:id").patch(isAuthenticatedUser, authorizeRoles("admin"), approveWithdrawal);
router.route("/reject/:id").patch(isAuthenticatedUser, authorizeRoles("admin"), cancelWithdrawal);
router.route("/all").get(isAuthenticatedUser, authorizeRoles("admin"), getAllWithdrawals);
router.route("/me").get(isAuthenticatedUser, getMyWithdrawals);
router.route("/user/:id").get(isAuthenticatedUser, authorizeRoles("admin"), getUserWithdrawals);

export default router;