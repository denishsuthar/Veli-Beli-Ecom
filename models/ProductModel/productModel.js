import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Product Name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please Enter Product Description"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Please Enter Product Price"],
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategory: {
    type: mongoose.Schema.ObjectId,
    ref: "Subcategory",
    required: [true, "Please Enter Subcategory ID"],
  },
  stock: {
    type: Number,
    required: [true, "Please Enter product Stock"],
    default: 1,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.model("Product", productSchema);
