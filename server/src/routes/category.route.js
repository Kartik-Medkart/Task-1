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

router.use(verifyJWT);
router.use(restrict(["admin"]));

// Route to create a new category
router.post("/", createCategory);

// Route to get all categories
router.get("/", getAllCategories);

// Route to get a single category by ID
router.get("/:id", getCategoryById);

// Route to update a category by ID
router.put("/:id", updateCategory);

// Route to delete a category by ID
router.delete("/:id", deleteCategory);

export default router;