import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";
import { addGame, declareWinner, deleteGamesById, getAllGames, toggleBet, updateGamesById } from "../controller/gameController.js";

const router = express.Router();

router.route('/add').post(isAuthenticatedUser, authorizeRoles("admin"), addGame);
router.route('/all').get(getAllGames);
router.route('/delete').delete(isAuthenticatedUser, authorizeRoles("admin"), deleteGamesById);
router.route('/edit/:id').put(isAuthenticatedUser, authorizeRoles("admin"), updateGamesById);
router.route('/winner').post(isAuthenticatedUser, authorizeRoles("admin"), declareWinner);
router.route('/:id/toggle-bet').put(isAuthenticatedUser, authorizeRoles("admin"), toggleBet);

export default router;