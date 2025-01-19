import { Router } from "express";
import {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
} from "../controllers/tag.controller.js";

const router = Router();

import { verifyJWT, restrict } from "../middlewares/auth.middleware.js";

// Route to get all tags
router.get("/", getAllTags);

// Route to create a new tag
router.post("/", verifyJWT, restrict(["admin"]), createTag);


// Route to get a single tag by ID
router.get("/:id", verifyJWT, restrict(["admin"]), getTagById);

// Route to update a tag by ID
router.put("/:id", verifyJWT, restrict(["admin"]), updateTag);

// Route to delete a tag by ID
router.delete("/:id", verifyJWT, restrict(["admin"]), deleteTag);

export default router;