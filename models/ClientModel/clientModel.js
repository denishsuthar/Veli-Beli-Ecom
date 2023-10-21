import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const clientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please Enter First Name"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Please Enter Last Name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please Enter Email"],
    validate: validator.isEmail,
    unique: [true, "Email must be Unique"],
  },
  password: {
    type: String,
    select: false,
    required: [true, "Please Enter Password"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  mobileNumber: {
    type: Number,
    unique: [true, "Mobile Number must be Unique"],
  },
  gstNumber: {
    type: String,
    required: true,
    unique: true,
  },
  gstDetails: {
    ntcrbs: String,
    adhrVFlag: String,
    lgnm: String,
    stj: String,
    dty: String,
    cxdt: String,
    gstin: String,
    nba: [String],
    ekycVFlag: String,
    cmpRt: String,
    rgdt: String,
    ctb: String,
    pradr: {
      adr: String,
      addr: {
        flno: String,
        lg: String,
        loc: String,
        pncd: String,
        bnm: String,
        city: String,
        lt: String,
        stcd: String,
        bno: String,
        dst: String,
        st: String,
      },
    },
    sts: String,
    tradeNam: String,
    isFieldVisitConducted: String,
    adhrVdt: String,
    ctj: String,
    einvoiceStatus: String,
    lstupdt: String,
    adadr: [String],
    ctjCd: String,
    errorMsg: String,
    stjCd: String,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  role: {
    type: String,
    required: true,
    default:"client"
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  favorites: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    },
  ],
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isLogin: {
    type: Boolean,
    default: false,
  },
  devicesAllowed: {
    type: Number,
    required: true,
    default: 1,
  },
  deviceIDs:[
    {
      IMEI:{
        type:String,
        unique:[true, "IMEI must be Unique"]
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Token
clientSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRY,
  });
};

// Hash Password
clientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//Compare Password
clientSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const Client = mongoose.model("Client", clientSchema);
