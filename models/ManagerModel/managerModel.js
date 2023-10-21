import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const managerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please Enter First Name"],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, "Please Enter Last Name"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Please Enter Email"],
    validate: validator.isEmail,
    unique:[true, "Email must be Unique"]
  },
  password: {
    type: String,
    select: false,
    required: [true, "Please Enter Password"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  mobileNumber: {
    type: Number,
    unique:[true, "Mobile Number must be Unique"]
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  role: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isLogin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Token
managerSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id, role:this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRY,
  });
};

// Hash Password
managerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//Compare Password
managerSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const Manager = mongoose.model("Manager", managerSchema);