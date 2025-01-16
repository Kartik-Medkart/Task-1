import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from '../utils/asyncHandler.js';
import {models} from '../db/index.js';

const { Category } = models;

// Create a new category
export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const category = await Category.create({ name });

  res.status(201).json(new ApiResponse(201, category, "Category Created Successfully"));
});

// Get all categories
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.findAll();

  res.status(200).json(new ApiResponse(200, categories, "Categories Retrieved Successfully"));
});

// Get a single category by ID
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByPk(id);

  if (!category) {
    res.status(404).json(new ApiResponse(404, null, "Category Not Found"));
    return;
  }

  res.status(200).json(new ApiResponse(200, category, "Category Retrieved Successfully"));
});

// Update a category by ID
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findByPk(id);

  if (!category) {
    res.status(404).json(new ApiResponse(404, null, "Category Not Found"));
    return;
  }

  category.name = name;
  await category.save();

  res.status(200).json(new ApiResponse(200, category, "Category Updated Successfully"));
});

// Delete a category by ID
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByPk(id);

  if (!category) {
    res.status(404).json(new ApiResponse(404, null, "Category Not Found"));
    return;
  }

  await category.destroy();

  res.status(200).json(new ApiResponse(200, null, "Category Deleted Successfully"));
});