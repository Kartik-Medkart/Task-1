import { models } from "../db/index.js";
import { Op } from 'sequelize';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { where } from "sequelize";

const { Product } = models;

// Create a new product
export const createProduct = asyncHandler(async (req, res) => {
  console.log("Create Product Controller");
  const { product_name, ws_code, price, package_size, tags } = req.body;

  //   console.log(req.body, '\n\n');
  //   console.log(req.files);

  const product = await Product.findOne({ where: { ws_code } });
  console.log(product);
  if (product) {
    res
      .status(400)
      .json(
        new ApiResponse(400, null, "Product with this WS Code already exists")
      );
    throw new ApiError(400, "Product with this WS Code already exists");
  }

  const images = [];
  if (req.files && req.files.images) {
    const files = req.files.images;
    // console.log(files);
    for (const file of files) {
      const image = await uploadOnCloudinary(file.path);
      images.push(image.secure_url);
    }
  } else {
    res
      .status(400)
      .json(new ApiResponse(400, null, "At Least One Image is required"));
    throw new ApiError(400, "Images are required");
  }

  let newProduct;
  try {
    newProduct = await Product.create({
      product_name,
      ws_code,
      price,
      package_size,
      images,
      tags,
    });
  } catch (error) {
    res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          error?.message || "Error While Creating Product"
        )
      );
    throw new ApiError(400, error?.message || "Error While Creating Product");
  }

  res
    .status(201)
    .json(new ApiResponse(201, newProduct, "Product Created Successfully"));
});

// Get all products
export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll();
  res
    .status(200)
    .json(new ApiResponse(200, products, "Products Retrieved Successfully"));
});

// Get a single product by ID
export const getProductByWsCode = asyncHandler(async (req, res) => {
  const { WsCode } = req.params;
  const product = await Product.findOne({ where: { ws_code: WsCode } });

  if (!product) {
    res.status(404).json(new ApiResponse(404, null, "Product Not Found"));
    throw new ApiError("Product Not Found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product Retrieved Successfully"));
});

// Update a product by ID
export const updateProduct = asyncHandler(async (req, res) => {
  const { WsCode } = req.params;
  const { product_name, price, package_size, tags } = req.body;

  const product = await Product.findOne({ where: { ws_code: WsCode } });

  if (!product) {
    res.status(404).json(new ApiResponse(404, null, "Product Not Found"));
    throw new ApiError("Product Not Found");
  }

  product.product_name = product_name;
  product.price = price;
  product.package_size = package_size;
  product.tags = tags;

  await product.save();

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product Updated Successfully"));
});

export const updateProductImage = asyncHandler(async (req, res) => {
  const { WsCode, currentImageUrl } = req.body;
  const newImage = req.file;

  const product = await Product.findOne({ where: { ws_code: WsCode } });

  if (!product) {
    res.status(404).json(new ApiResponse(404, null, "Product Not Found"));
    throw new ApiError("Product Not Found");
  }

  const newImageUrl = await uploadOnCloudinary(newImage.path);

  const updatedImages = product.images.map((imageUrl) =>
    imageUrl === currentImageUrl ? newImageUrl.secure_url : imageUrl
  );
  product.images = updatedImages;

  await product.save();

  await deleteFromCloudinary(currentImageUrl);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { image: newImageUrl.secure_url },
        "Product Image Updated Successfully"
      )
    );
});

export const updateProductImages = asyncHandler(async (req, res) => {
  const { WsCode } = req.body; 

  const product = await Product.findOne({ where: { ws_code: WsCode } });

  if (!product) {
    res.status(404).json(new ApiResponse(404, null, "Product Not Found"));
    throw new ApiError("Product Not Found");
  }

  const images = [];
  if (req.files && req.files.images) {
    const files = req.files.images;
    for (const file of files) {
      const image = await uploadOnCloudinary(file.path);
      images.push(image.secure_url);
    }
  } else {
    res
      .status(400)
      .json(new ApiResponse(400, null, "At Least One Image is required"));
    throw new ApiError(400, "Images are required");
  }

  const currentImageUrls = product.images;

  product.images = images;

  await product.save();

  await Promise.all(
    currentImageUrls.map(async (imageUrl) => {
      await deleteFromCloudinary(imageUrl);
    })
  );

  res
    .status(200)
    .json(new ApiResponse(200, {images : product.images}, "Product Images Updated Successfully"));
});

// Delete a product by ID
export const deleteProduct = asyncHandler(async (req, res) => {
  const { WsCode } = req.params;

  const product = await Product.findOne({ where: { ws_code: WsCode } });

  if (!product) {
    res.status(404).json(new ApiResponse(404, null, "Product Not Found"));
    throw new ApiError("Product Not Found");
  }

  const currentImageUrls = product.images;

  await Promise.all(
    currentImageUrls.map(async (imageUrl) => {
      await deleteFromCloudinary(imageUrl);
    })
  );

  await product.destroy();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Product Deleted Successfully"));
});

export const searchProducts = asyncHandler(async (req, res) => {
    const { product_name, min_price, max_price, tags } = req.query;
  
    const whereClause = {};
  
    if (product_name) {
      whereClause.product_name = { [Op.iLike]: `%${product_name}%` };
    }
  
    if (min_price || max_price) {
        whereClause.price = {};
        if (min_price) {
          whereClause.price[Op.gte] = Number(min_price);
        }
        if (max_price) {
          whereClause.price[Op.lte] = Number(max_price);
        }
      }
  
    if (tags) {
      whereClause.tags = { [Op.overlap]: tags.split(',') };
    }

    console.log(whereClause);
  
    const products = await Product.findAll({ where: whereClause });
  
    res.status(200).json(new ApiResponse(200, products, "Products Retrieved Successfully"));
  });