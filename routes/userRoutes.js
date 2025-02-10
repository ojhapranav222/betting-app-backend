import express from "express";
import { forgotPassword, getAllUsers, getUserDetails, loginUser, logoutUser, registerUser, resetPassword, updateUserPassword } from "../controller/userController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middleware/auth.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/password/update").put(isAuthenticatedUser, updateUserPassword);
router.route("/admin/all").get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);

export default router;