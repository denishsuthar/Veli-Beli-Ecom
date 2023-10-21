import express from "express"
import { isAdmin, isAuthenticatedUser } from "../../middelware/auth.js";
import { allOrders, createOrder, updateOrderStatus } from "../../controllers/ProductController/orderController.js";


const router = express.Router();

router.route("/order/add").post(isAuthenticatedUser, createOrder)

router.route("/orders").get(isAuthenticatedUser, isAdmin, allOrders)

router.route("/update/orderstatus/:id").put(isAuthenticatedUser, isAdmin, updateOrderStatus)




export default router