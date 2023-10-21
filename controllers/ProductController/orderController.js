import catchAsyncError from "../../middelware/catchAsyncError.js";
import { Client } from "../../models/ClientModel/clientModel.js";
import { Order } from "../../models/ProductModel/orderModel.js";
import { Product } from "../../models/ProductModel/productModel.js";
import ErrorHandler from "../../utils/errorHandler.js";

// Create Order
export const createOrder = catchAsyncError(async (req, res, next) => {
  const { notes, shippingAddress } = req.body;
  if (!notes || !shippingAddress)
    return next(new ErrorHandler("Please Fill All Fields", 400));

  const clientId = req.user._id;

  const client = await Client.findById(clientId).populate("cart.product");

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "Client not found",
    });
  }

  if (client.cart.length === 0) {
    return next(
      new ErrorHandler(
        "Your cart is empty. Add products to your cart before placing an order.",
        400
      )
    );
  }

  let totalAmount = 0;

  for (const { product, quantity } of client.cart) {
    totalAmount += product.price * quantity;
  }

  for (const { product, quantity } of client.cart) {
    const products = await Product.findById(product);

    if (!products) {
      return res.status(404).json({
        success: false,
        message: `Product not found for ID: ${product}`,
      });
    }
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for product: ${product.name}`,
      });
    }

    // product.stock -= quantity;
    // await product.save();
  }

  const order = new Order({
    client: clientId,
    products: client.cart,
    totalAmount,
    notes,
    shippingAddress,
  });

  await order.save();

  client.cart = [];
  await client.save();

  res.status(201).json({
    success: true,
    message: "Order Placed Succesfully",
    order,
  });
});

//Get All Orders
export const allOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find()
    .sort({ _id: -1 })
    .populate("products.product", "name price");
  res.status(200).json({
    success: true,
    orders,
  });
});

// Update Order Status
export const updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const { orderStatus, notes } = req.body;
  const orderId = req.params.id;

  const order = await Order.findById(orderId);
  if (!order) return next(new ErrorHandler("No Order Found", 404));

  if (order.orderStatus === "delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  if (orderStatus === "shipped" && order.orderStatus !== "shipped") {
    for (const { product, quantity } of order.products) {
      const updatedProduct = await Product.findById(product);

      if (!updatedProduct) {
        return next(
          new ErrorHandler(`Product not found with ID: ${product}`, 404)
        );
      }

      if (updatedProduct.stock < quantity) {
        return next(
          new ErrorHandler(
            `Insufficient stock for product: ${updatedProduct.name}`,
            400
          )
        );
      }
      updatedProduct.stock -= quantity;
      await updatedProduct.save();
    }
  }

  if (req.body.orderStatus === "delivered") {
    order.deliveredAt = Date.now();
  }

  order.orderStatus = orderStatus;
  order.notes = notes;

  await order.save();

  res.status(200).json({
    success: true,
    message: `Order status updated to ${orderStatus} succesfully`,
    order,
  });
});
