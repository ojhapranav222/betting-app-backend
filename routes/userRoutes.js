import express from "express";
import { forgotPassword, getAllUsers, getUser, getUserDetails, loginUser, logoutUser, registerUser, resetPassword, updateUserPassword, updateUserRole } from "../controller/userController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middleware/auth.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
// router.route("/password/forgot").post(forgotPassword);
// router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
//router.route("/password/update").put(isAuthenticatedUser, updateUserPassword);
router.route("/admin/all").get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);
router.route("/admin/user-data/:id").get(isAuthenticatedUser, authorizeRoles("admin"), getUser);
router.route("/admin/update-role/:id").patch(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole);

export default router;