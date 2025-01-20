import { models } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const { Tag, Product } = models;

// Create a new tag
export const createTag = asyncHandler(async (req, res) => {
  const { name } = req.body;

  let tag = await Tag.findOne({ where: { name } });
  if(tag){
    return res.status(400).json(new ApiResponse(400, [], "Tag Already Exists"));
  }

  const newTag = await Tag.create({ name });

  res.status(201).json(new ApiResponse(201, newTag, "Tag Created Successfully"));
});

// Get all tags
export const getAllTags = asyncHandler(async (req, res) => {
  const tags = await Tag.findAll();

  res.status(200).json(new ApiResponse(200, tags, "Tags Retrieved Successfully"));
});

// Get a single tag by ID
export const getTagById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tag = await Tag.findByPk(id, {
    include: [
      {
        model: Product,
        as: 'taggedProducts',
      },
    ],
  });

  if (!tag) {
    res.status(404).json(new ApiResponse(404, null, "Tag Not Found"));
    throw new ApiError(404, "Tag Not Found");
  }

  res.status(200).json(new ApiResponse(200, tag, "Tag Retrieved Successfully"));
});

// Update a tag by ID
export const updateTag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const tag = await Tag.findByPk(id);

  if (!tag) {
    res.status(404).json(new ApiResponse(404, null, "Tag Not Found"));
    throw new ApiError(404, "Tag Not Found");
  }

  tag.name = name;
  await tag.save();

  res.status(200).json(new ApiResponse(200, tag, "Tag Updated Successfully"));
});

// Delete a tag by ID
export const deleteTag = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tag = await Tag.findByPk(id);

  if (!tag) {
    res.status(404).json(new ApiResponse(404, null, "Tag Not Found"));
    throw new ApiError(404, "Tag Not Found");
  }

  await tag.destroy();

  res.status(200).json(new ApiResponse(200, null, "Tag Deleted Successfully"));
});