import express from "express"
import { allUserById, allUsers, createAdmin, createManager } from "../../controllers/AdminController/adminController.js";
import { isAdmin, isAuthenticatedUser } from "../../middelware/auth.js";

const router = express.Router();

router.route("/users").get(isAuthenticatedUser, isAdmin, allUsers)

router.route("/user/:id").get(isAuthenticatedUser, isAdmin, allUserById)

router.route("/add/admin").post(isAuthenticatedUser, isAdmin,createAdmin)

router.route("/add/manager").post(isAuthenticatedUser, isAdmin,createManager)


export default router