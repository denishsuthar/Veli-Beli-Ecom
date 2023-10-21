import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Category Name"],
    trim: true,
    unique: [true, "Category Name Should be Unique"],
  },
  description: {
    type: String,
    trim: true,
  },
  products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
  subCategory:[
    {
      type: mongoose.Schema.ObjectId,
      ref: "Subcategory",
    },
  ],
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

export const Category = mongoose.model("Category", categorySchema);
