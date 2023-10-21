import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "./catchAsyncError.js";

// Authentication
export const isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const token = req.headers["token"];
  if (!token) return next(new ErrorHandler("Token Not Provided", 401));

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decodedToken;

  next();
});

// Admin
export const isAdmin = catchAsyncError(async (req, res, next) => {
  const token = req.headers["token"];
  if (!token) return next(new ErrorHandler("Token Not Provided", 401));

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decodedToken;

  if (req.user.role !== "admin")
    return next(
      new ErrorHandler(
        `${req.user.role} is not allowed to access this Resource`,
        401
      )
    );

  next();
});

// For Admin & Manager
export const isAdminisManager = catchAsyncError(async (req, res, next) => {
  const token = req.headers["token"];
  if (!token) return next(new ErrorHandler("Token Not Provided", 401));

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decodedToken;

  if (req.user.role !== "admin" && req.user.role !== "manager")
    return next(
      new ErrorHandler(
        `${req.user.role} is not allowed to access this Resource`,
        401
      )
    );

  next();
});
