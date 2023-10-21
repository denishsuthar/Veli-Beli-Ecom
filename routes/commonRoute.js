import express from "express"
import { loginForMobile, loginForWeb, logout, myProfile } from "../controllers/commonController.js";
import { isAuthenticatedUser } from "../middelware/auth.js";

const router = express.Router();

router.route("/web/login").post(loginForWeb)

router.route("/mobile/login").post(loginForMobile)

router.route("/logout").get(logout)

router.route("/me").get(isAuthenticatedUser, myProfile)

export default router