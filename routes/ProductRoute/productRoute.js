import express from "express"
import { isAdmin, isAdminisManager, isAuthenticatedUser } from "../../middelware/auth.js";
import { allCategory, allProducts, createCategory, createProduct, createSubCategory } from "../../controllers/ProductController/productController.js";

const router = express.Router();

router.route("/add/category").post(isAuthenticatedUser, isAdmin, createCategory)

router.route("/add/subcategory").post(isAuthenticatedUser, isAdmin, createSubCategory)

router.route("/categories").get(isAuthenticatedUser, isAdmin, allCategory)

router.route("/products").get(isAuthenticatedUser, allProducts)

router.route("/add/product").post(isAuthenticatedUser, isAdmin, createProduct)





export default router