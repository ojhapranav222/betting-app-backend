import express from "express";
import { deleteBank, editBank, getAllBanks, getPrimaryBank, registerBank } from "../controller/bankController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.route("/register").post(isAuthenticatedUser, authorizeRoles("admin"), registerBank);
router.route("/all").get(isAuthenticatedUser, authorizeRoles("admin"), getAllBanks);
router.route("/primary").get(isAuthenticatedUser, getPrimaryBank);
router.route("/edit/:id").put(isAuthenticatedUser, authorizeRoles("admin"), editBank);
router.route("/delete/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteBank);

export default router;