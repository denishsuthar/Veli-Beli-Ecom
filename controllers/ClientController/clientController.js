import catchAsyncError from "../../middelware/catchAsyncError.js";
import { Admin } from "../../models/AdminModel/adminModel.js";
import { Client } from "../../models/ClientModel/clientModel.js";
import { Manager } from "../../models/ManagerModel/managerModel.js";
import ErrorHandler from "../../utils/errorHandler.js";
import fs from "fs";
import axios from "axios";
import { cache } from "../AdminController/adminController.js";
import { Product } from "../../models/ProductModel/productModel.js";
import { Order } from "../../models/ProductModel/orderModel.js";

const messages = JSON.parse(fs.readFileSync("./messages.json", "utf8"));

// Register Client
export const registerClient = catchAsyncError(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    mobileNumber,
    gstNumber,
    status,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !mobileNumber ||
    !gstNumber
  )
    return next(new ErrorHandler(messages.allFieldRequired, 400));

  const existingAdmin = await Admin.findOne({ email });
  const existingManager = await Manager.findOne({ email });
  const existingClient = await Client.findOne({ email });
  if (existingAdmin || existingManager || existingClient)
    return next(new ErrorHandler(messages.alreadyRegistered, 400));

  const existingAdminWithMobile = await Admin.findOne({ mobileNumber });
  const existingManagerWithMobile = await Manager.findOne({ mobileNumber });
  const existingClientWithMobile = await Client.findOne({ mobileNumber });
  if (
    existingAdminWithMobile ||
    existingManagerWithMobile ||
    existingClientWithMobile
  ) {
    return next(new ErrorHandler(messages.mobileInUse, 400));
  }

  const gstApiUrl = `http://sheet.gstincheck.co.in/check/8ae78dbbab39732925c610f4d5482ad4/${gstNumber}`;

  const gstDetailsResponse = await axios.get(gstApiUrl);

  if (gstDetailsResponse.data.flag === true) {
    const gstDetails = gstDetailsResponse.data.data;

    if (gstDetails.sts === "Active") {
      const client = new Client({
        firstName,
        lastName,
        email,
        password,
        mobileNumber,
        gstNumber,
        role: "client",
        status,
        gstDetails,
      });

      await client.save();

      const page = parseInt(req.query.page) || 1;
      const perPage = 5;
      const searchQuery = req.query.search || "";
      const roleFilter = req.query.role || "";
      const usersCache = `${page}_${perPage}_${searchQuery}_${roleFilter}`;

      cache.del(usersCache);

      return res.status(201).json({
        success: true,
        message: messages.clientRegistered,
        client,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: messages.gstStatusIsNotActive });
    }
  } else {
    return res
      .status(400)
      .json({ success: false, message: messages.invalidGST });
  }
});

// Add to Cart
export const addToCart = catchAsyncError(async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return next(
      new ErrorHandler("Please provide both productId and quantity.", 400)
    );
  }

  const client = await Client.findById(req.user._id);

  if (!client) {
    return next(new ErrorHandler("Client not found.", 404));
  }

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found.", 404));
  }
  if (quantity > product.stock) {
    return next(new ErrorHandler("Insufficient stock for this product.", 400));
  }

  const cartItemIndex = client.cart.findIndex((item) =>
    item.product.equals(product._id)
  );

  if (cartItemIndex !== -1) {
    if (quantity + client.cart[cartItemIndex].quantity > product.stock) {
      return next(
        new ErrorHandler("Adding this quantity exceeds available stock.", 400)
      );
    }

    client.cart[cartItemIndex].quantity += quantity;
  } else {
    client.cart.push({ product: product._id, quantity });
  }

  await client.save();

  res.status(200).json({
    success: true,
    message: "Product added to cart successfully.",
  });
});

// Add to Favorites
export const addToFavorites = catchAsyncError(async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return next(new ErrorHandler("Please provide a productId.", 400));
  }

  const client = await Client.findById(req.user._id);

  if (!client) {
    return next(new ErrorHandler("Client not found.", 404));
  }

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found.", 404));
  }

  const isProductInFavorites = client.favorites.some((item) =>
    item.product.equals(product._id)
  );

  if (!isProductInFavorites) {
    client.favorites.push({ product: product._id });
  }

  await client.save();

  res.status(200).json({
    success: true,
    message: "Product added to favorites successfully.",
  });
});

// Remove from Cart
export const removeFromCart = catchAsyncError(async (req, res, next) => {
  const productId = req.params.id;

  if (!productId) {
    return next(new ErrorHandler("Please provide a productId.", 400));
  }

  const client = await Client.findById(req.user._id);

  if (!client) {
    return next(new ErrorHandler("Client not found.", 404));
  }
  const cartItemIndex = client.cart.findIndex((item) =>
    item.product.equals(productId)
  );

  if (cartItemIndex !== -1) {
    client.cart.splice(cartItemIndex, 1);
    await client.save();

    res.status(200).json({
      success: true,
      message: "Product removed from the cart successfully.",
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Product not found in the cart.",
    });
  }
});

// Remove from Favorite
export const removeFromFavorites = catchAsyncError(async (req, res, next) => {
  const productId = req.params.id;

  if (!productId) {
    return next(new ErrorHandler("Please provide a productId.", 400));
  }

  const client = await Client.findById(req.user._id);

  if (!client) {
    return next(new ErrorHandler("Client not found.", 404));
  }

  const isProductInFavorites = client.favorites.some((item) =>
    item.product.equals(productId)
  );

  if (isProductInFavorites) {
    client.favorites = client.favorites.filter(
      (item) => !item.product.equals(productId)
    );
    await client.save();

    res.status(200).json({
      success: true,
      message: "Product removed from favorites successfully.",
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Product not found in favorites.",
    });
  }
});

// View My Orders
export const myOrders = catchAsyncError(async (req, res, next) => {
  const clientId = req.user._id;
  const orders = await Order.find({ client: clientId }).sort({_id:-1}).populate("products.product", "name price");
  res.status(200).json({
    success: true,
    orders,
  });
});
