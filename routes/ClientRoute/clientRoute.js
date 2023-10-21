import express from "express"
import { addToCart, addToFavorites, myOrders, registerClient, removeFromCart, removeFromFavorites } from "../../controllers/ClientController/clientController.js";
import { isAuthenticatedUser } from "../../middelware/auth.js";

const router = express.Router();

router.route("/register/client").post(registerClient)

router.route("/cart/add").post(isAuthenticatedUser, addToCart)

router.route("/favorite/add").post(isAuthenticatedUser, addToFavorites)

router.route("/cart/remove/:id").post(isAuthenticatedUser, removeFromCart)

router.route("/favorite/remove/:id").post(isAuthenticatedUser, removeFromFavorites)

router.route("/myorders").get(isAuthenticatedUser, myOrders)




export default router