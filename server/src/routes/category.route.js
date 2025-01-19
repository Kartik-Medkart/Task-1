import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { verifyJWT, restrict } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route to get all categories
router.get("/", getAllCategories);

// Route to create a new category
router.post("/", verifyJWT, restrict(["admin"]), createCategory);

// Route to get a single category by ID
router.get("/:id", verifyJWT, restrict(["admin"]), getCategoryById);

// Route to update a category by ID
router.put("/:id", verifyJWT, restrict(["admin"]), updateCategory);

// Route to delete a category by ID
router.delete("/:id", verifyJWT, restrict(["admin"]), deleteCategory);

export default router;