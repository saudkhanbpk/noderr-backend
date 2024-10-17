import express from "express";
import { getUserProfile, logOutUser, registerOrLoginUser, updateUserProfile, signupForBetaLaunch } from "../controller/userController.js";
import { isAuthenticated } from "../middleware/Auth.js";
import { upload } from "../helper/imageUpload.js";
const router = express.Router();

router.route("/register-or-login-user").post(registerOrLoginUser);
router.route("/logout").get(logOutUser);
router.route("/update-profile").put(upload.single("myFile"),isAuthenticated,updateUserProfile);
router.route("/profile").get(isAuthenticated,getUserProfile);
router.route("/signup-for-beta").post(signupForBetaLaunch);

export default router;
