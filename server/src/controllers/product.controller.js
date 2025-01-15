import { models } from "../db/index.js";
import { Op, where } from "sequelize";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const { Product, ProductImages, ProductTags } = models;

// Create a new product
export const createProduct = asyncHandler(async (req, res) => {
  console.log("Create Product Controller");
  const { product_name, ws_code, price, package_size, tags } = req.body;

  const product = await Product.findOne({ where: { ws_code } });

  if (product) {
    res
      .status(400)
      .json(
        new ApiResponse(400, null, "Product with this WS Code already exists")
      );
    throw new ApiError(400, "Product with this WS Code already exists");
  }

  let newProduct;
  try {
    newProduct = await Product.create({
      product_name,
      ws_code,
      price,
      package_size
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

  if (req.files && req.files.images) {
    const files = req.files.images;

    try {
      const uploadPromises = files.map(async (file) => {
        const image = await uploadOnCloudinary(file.path);
        return ProductImages.create({
          product_id: newProduct.product_id,
          url: image.secure_url,
        });
      });

      await Promise.all(uploadPromises);
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .json(new ApiResponse(400, null, "Error While Uploading Images"));
        throw new ApiError(400, "Error While Uploading Images" || error.message);
    }
  }

  if (tags && tags.length > 0) {
    try {
      const tagPromises = tags.map(tag_id => {
        return ProductTags.create({
          product_id: newProduct.product_id,
          tag_id,
        });
      });

      await Promise.all(tagPromises);
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .json(new ApiResponse(400, null, "Error While Adding Tags to Product"));
      throw new ApiError(400, "Error While Adding Tags to Product");
    }
  }

  res
    .status(201)
    .json(new ApiResponse(201, newProduct, "Product Created Successfully"));
});

// Get all products
export const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const offset = (page - 1) * limit;
  
  const products = await Product.findAndCountAll({
    limit: Number(limit),
    offset: Number(offset),
  });

  const totalPages = Math.ceil(products.count / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products: products.rows,
        totalItems: products.count,
        totalPages,
        currentPage: Number(page),
      },
      "Products Retrieved Successfully"
    )
  );
});

// Get a single product by ID
export const getProductByWsCode = asyncHandler(async (req, res) => {
  const { WsCode } = req.params;
  let product = await Product.findOne({ where: { ws_code: WsCode } });

  if (!product) {
    res.status(404).json(new ApiResponse(404, null, "Product Not Found"));
    throw new ApiError("Product Not Found");
  }

  const Product_Images = await ProductImages.findAll({
    where: { product_id: product.product_id },
  });

  const images = Product_Images.map((image) => {
    return {id : image.image_id,url : image.url}
  }
  );
  product = product.toJSON();
  product.images = images;

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product Retrieved Successfully"));
});

// Update a product by ID
export const updateProduct = asyncHandler(async (req, res) => {
  const { WsCode } = req.params;
  const { product_name, price, package_size } = req.body;

  const product = await Product.findOne({ where: { ws_code: WsCode } });

  if (!product) {
    res.status(404).json(new ApiResponse(404, null, "Product Not Found"));
    throw new ApiError("Product Not Found");
  }

  product.product_name = product_name;
  product.price = price;
  product.package_size = package_size;

  await product.save();

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product Updated Successfully"));
});

export const updateProductImage = asyncHandler(async (req, res) => {
  const { currentImageId } = req.body;
  const newImage = req.file;

  if(!newImage){
    res.status(400).json(new ApiResponse(400, null, "Image is required"));
    throw new ApiError("Image is required");
  }

  const image = await ProductImages.findOne({ where: { image_id: currentImageId } });

  if (!image) {
    res.status(404).json(new ApiResponse(404, null, "Image Not Found"));
    throw new ApiError("Image Not Found");
  }

  const currentImageUrl = image.url;
  const newImageUrl = await uploadOnCloudinary(newImage.path);
  image.url = newImageUrl.secure_url;

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
  
  const images = await ProductImages.findAll({ where: { product_id: product.product_id } });

  if (!product) {
    res.status(404).json(new ApiResponse(404, null, "Product Not Found"));
    throw new ApiError("Product Not Found");
  }

  if (req.files && req.files.images) {
    const files = req.files.images;

    try {
      const uploadPromises = files.map(async (file) => {
        const image = await uploadOnCloudinary(file.path);
        return ProductImages.create({
          product_id: product.product_id,
          url: image.secure_url,
        });
      });

      await Promise.all(uploadPromises);
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .json(new ApiResponse(400, null, "Error While Uploading Images"));
        throw new ApiError(400, "Error While Uploading Images" || error.message);
    }
  }


  await Promise.all(
    images.map(async (imageUrl) => {
      await deleteFromCloudinary(imageUrl);
    })
  );

  await images.destroy();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { images: product.images },
        "Product Images Updated Successfully"
      )
    );
});

// Delete a product by ID
export const deleteProduct = asyncHandler(async (req, res) => {
  const { WsCode } = req.params;

  const product = await Product.findOne({ where: { ws_code: WsCode } });

  if (!product) {
    res.status(404).json(new ApiResponse(404, null, "Product Not Found"));
    throw new ApiError("Product Not Found");
  }

  const currentImageUrls = await ProductImages.findAll({where: { product_id: product.product_id }});

  await Promise.all(
    currentImageUrls.map(async (image) => {
      await deleteFromCloudinary(image.url);
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
    whereClause.tags = { [Op.overlap]: tags.split(",") };
  }

  console.log(whereClause);

  const products = await Product.findAll({ where: whereClause });

  res
    .status(200)
    .json(new ApiResponse(200, products, "Products Retrieved Successfully"));
});
