import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middleware/auth.js";
import { cancelBet, createBet, getAllBets, getMyBets } from "../controller/betController.js";

const router = express.Router();

router.route('/place-bet').post(isAuthenticatedUser, createBet);
router.route('/me').get(isAuthenticatedUser, getMyBets);
router.route('/all').get(isAuthenticatedUser, authorizeRoles("admin"), getAllBets);
router.route('/cancel/:betId').put(isAuthenticatedUser, cancelBet);

export default router;