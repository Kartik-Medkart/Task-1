import { Router } from "express";
import {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
} from "../controllers/tag.controller.js";

const router = Router();

// Route to create a new tag
router.post("/", createTag);

// Route to get all tags
router.get("/", getAllTags);

// Route to get a single tag by ID
router.get("/:id", getTagById);

// Route to update a tag by ID
router.put("/:id", updateTag);

// Route to delete a tag by ID
router.delete("/:id", deleteTag);

export default router;