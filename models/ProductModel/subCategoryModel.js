import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Sub-Category Name"],
    trim: true,
    unique: [true, "Sub-Category Name Should be Unique"],
  },
  description: {
    type: String,
    trim: true,
  },
  category: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
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

export const Subcategory = mongoose.model("Subcategory", subCategorySchema);
