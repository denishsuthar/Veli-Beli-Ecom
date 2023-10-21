import catchAsyncError from "../../middelware/catchAsyncError.js";
import { Category } from "../../models/ProductModel/categoryModel.js";
import { Product } from "../../models/ProductModel/productModel.js";
import { Subcategory } from "../../models/ProductModel/subCategoryModel.js";
import ErrorHandler from "../../utils/errorHandler.js";

// Create Category
export const createCategory = catchAsyncError(async (req, res, next) => {
  const { name, description, status } = req.body;
  if (!name) return next(new ErrorHandler("Please Enter Category Name", 400));

  let category = await Category.findOne({ name });
  if (category)
    return next(new ErrorHandler("Category Name Already Exist", 400));

  category = await Category.create({
    name,
    description,
    status,
  });

  res.status(201).json({
    success: true,
    category,
  });
});

// Create Sub-Category
export const createSubCategory = catchAsyncError(async (req, res, next) => {
  const { name, description, status, category } = req.body;
  if (!name || !category)
    return next(new ErrorHandler("Please Enter All Field", 400));

  let subCategory = await Subcategory.findOne({ name });
  if (subCategory)
    return next(new ErrorHandler("Sub-Category Name Already Exist", 400));

  subCategory = await Subcategory.create({
    name,
    description,
    status,
    category,
  });

  await Category.findByIdAndUpdate(category, {
    $push: { subCategory: subCategory._id },
  });

  res.status(201).json({
    success: true,
    subCategory,
  });
});

// Get All Category
export const allCategory = catchAsyncError(async (req, res, next) => {
  const category = await Category.find().populate("subCategory", "name");
  res.status(200).json({
    success: true,
    category,
  });
});

// Get All Products
export const allProducts = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 5;
  const searchQuery = req.query.search || "";
  const categoryName = req.query.category || "";

  const query = {};

  if (searchQuery) {
    query.$or = [
      { name: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
    ];
  }

  if (categoryName) {
    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      const subcategory = await Subcategory.findOne({ name: categoryName });

      if (!subcategory) {
        return res.status(400).json({
          success: false,
          message: "Invalid category or subcategory name",
        });
      }

      query.subCategory = subcategory._id;
    } else {
      query.category = category._id;
    }
  }

  const products = await Product.find(query)
    .populate("subCategory category", "name")
    .sort({ _id: -1 });

  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / perPage);

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const productsForPage = products.slice(startIndex, endIndex);

  res.status(200).json({
    success: true,
    products: productsForPage,
    totalProducts,
    currentPage: page,
    totalPages,
  });
});

// Create Product
export const createProduct = catchAsyncError(async (req, res, next) => {
  const { name, description, price, subCategory, stock, status } = req.body;
  if (!name || !description || !price || !subCategory)
    return next(new ErrorHandler("Please fill All Fields", 400));

  const subcategory = await Subcategory.findById(subCategory);

  if (!subcategory) {
    return next(new ErrorHandler("Subcategory not found", 404));
  }

  const product = await Product.create({
    name,
    description,
    price,
    subCategory: subcategory._id,
    category: subcategory.category,
    stock,
    status
  });

  res.status(201).json({
    success: true,
    product,
  });
});
