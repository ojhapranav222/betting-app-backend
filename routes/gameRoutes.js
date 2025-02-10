import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";
import { addGame, declareWinner, deleteGamesById, getAllGames, updateGamesById } from "../controller/gameController.js";

const router = express.Router();

router.route('/add').post(isAuthenticatedUser, authorizeRoles("admin"), addGame);
router.route('/all').get(isAuthenticatedUser, authorizeRoles("admin"), getAllGames);
router.route('/delete').delete(isAuthenticatedUser, authorizeRoles("admin"), deleteGamesById);
router.route('/edit/:id').put(isAuthenticatedUser, authorizeRoles("admin"), updateGamesById);
router.route('/winner').post(isAuthenticatedUser, authorizeRoles("admin"), declareWinner);

export default router;