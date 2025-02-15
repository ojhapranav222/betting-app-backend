import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";
import { getAllDeposits, getMyDeposits, getSingleDeposit, newDeposit, updateDepositStatus } from "../controller/depositController.js";

const router = express.Router();

router.route("/add").post(isAuthenticatedUser, newDeposit);
router.route("/all").get(isAuthenticatedUser, authorizeRoles("admin"), getAllDeposits);
router.route("/me").get(isAuthenticatedUser, getMyDeposits);
router.route("/user/:id").get(isAuthenticatedUser, authorizeRoles("admin"), getSingleDeposit);
router.route("/update-status").put(isAuthenticatedUser, authorizeRoles("admin"), updateDepositStatus)

export default router;