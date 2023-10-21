import catchAsyncError from "../middelware/catchAsyncError.js";
import { Admin } from "../models/AdminModel/adminModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import fs from "fs";
import sendToken from "../utils/sendToken.js";
import { Manager } from "../models/ManagerModel/managerModel.js";
import { Client } from "../models/ClientModel/clientModel.js";

const messages = JSON.parse(fs.readFileSync("./messages.json", "utf8"));

// Login - Web (Admin & Manager)
export const loginForWeb = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler(messages.allFieldRequired, 400));

  const users = await Promise.all([
    Admin.findOne({ email }).select("+password"),
    Manager.findOne({ email }).select("+password"),
  ]);

  let user = null;

  for (let i = 0; i < users.length; i++) {
    if (users[i] && !users[i].isDeleted && users[i].status === "active") {
      user = users[i];
      break;
    }
  }

  if (!user) {
    return next(new ErrorHandler(messages.incorrectEmail, 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    if (user.isLogin) {
      user.isLogin = false;
      await user.save();
    }
    return next(new ErrorHandler(messages.incorrectPassword, 401));
  }

  user.isLogin = true;
  await user.save();

  user.password = undefined;

  sendToken(res, user, `Welcome Back ${user.firstName}`, 200);
});

// Login - Mobile (Client)
export const loginForMobile = catchAsyncError(async (req, res, next) => {
  const { email, password, deviceID } = req.body;
  if (!email || !password || !deviceID)
    return next(new ErrorHandler(messages.allFieldRequired, 400));

  let isEmail = false;
  let isMobileNumber = false;

  if (email.includes("@" && ".")) {
    isEmail = true;
  } else {
    isMobileNumber = true;
  }

  const query = {
    $or: [
      { email: isEmail ? email : null },
      { mobileNumber: isMobileNumber ? email : null },
    ],
  };

  const user = await Client.findOne(query)
    .select("+password")
    .select("-gstDetails");

  if (!user) {
    if (isEmail) {
      return next(new ErrorHandler(messages.incorrectEmail, 400));
    } else {
      return next(new ErrorHandler(messages.incorrectMobile, 400));
    }
  }

  if (!user || user.isDeleted || user.status !== "active") {
    return next(new ErrorHandler(messages.incorrectEmail, 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    if (user.isLogin) {
      user.isLogin = false;
      await user.save();
    }
    return next(new ErrorHandler(messages.incorrectPassword, 401));
  }

  const isDeviceAssociated = user.deviceIDs.some(
    (device) => device.IMEI === deviceID
  );
  if (isDeviceAssociated) {
  } else {
    if (user.deviceIDs.length >= user.devicesAllowed) {
      return res
        .status(401)
        .json({ success: false, message: messages.deviceLimitReached });
    }
    user.deviceIDs.push({ IMEI: deviceID });
  }

  user.isLogin = true;
  await user.save();

  user.password = undefined;

  sendToken(res, user, `Welcome Back ${user.firstName}`, 200);
});

// Logout
export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .setHeader("token", null, {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logout SuccessFully",
    });
});

// Get My Profile
export const myProfile = catchAsyncError(async (req, res, next) => {
  let user = await Admin.findById(req.user._id);
  if (!user) {
    user = await Manager.findById(req.user._id);
  }
  if (!user) {
    user = await Client.findById(req.user._id).select("-gstDetails").populate("cart.product favorites.product", "name price");
  }
  res.status(200).json({
    success: true,
    user,
  });
});
