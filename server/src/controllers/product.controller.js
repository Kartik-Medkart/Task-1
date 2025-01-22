import { models } from "../db/index.js";
import { Op, where } from "sequelize";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const { Product, ProductImages, ProductTags, Tag, Category } = models;

// Create a new product
export const createProduct = asyncHandler(async (req, res) => {
  console.log("Create Product Controller");
  let { product_name, ws_code, price, package_size, category_id, tags } =
    req.values;
  
  let message = "Product Created Successfully";

  let newProduct;
  try {
    newProduct = await Product.create({
      product_name,
      ws_code,
      price,
      package_size,
      category_id,
    });
  } catch (error) {
    console.log(error);
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

  let images;
  if (Array.isArray(req.files?.images) && req.files?.images.length > 0) {
    const files = req.files.images;

    try {
      const uploadPromises = files.map(async (file) => {
        const imageName = file.originalname;
        const image = await uploadOnCloudinary(file.path);
        if (image) {
          return ProductImages.create({
            product_id: newProduct.product_id,
            url: image.secure_url,
          });
        } else {
          message += `\n${imageName} not uploaded.`;
          return Promise.resolve();
        }
      });

      images = await Promise.all(uploadPromises);
      images = images.map((image) => {
        image = image.toJSON();
        return { id: image.image_id, url: image.url };
      });

    } catch (error) {
      console.log(error);
      res
        .status(400)
        .json(new ApiResponse(400, null, "Error While Uploading Images"));
      throw new ApiError(400, "Error While Uploading Images" || error.message);
    }
  }

  let addedTags = [];
  if (Array.isArray(tags)) {
    try {
      const tagPromises = tags.map(async (tag_id) => {
        const tag = await Tag.findByPk(tag_id);
        if (!tag) {
          message += `\nTag with ID ${tag_id} not found.`;
          return Promise.resolve();
        }
        const productTag = await ProductTags.findOne({
          where: { product_id: newProduct.product_id, tag_id },
        });
        if (productTag) {
          return Promise.resolve();
        }
        addedTags.push(tag.tag_id);
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

  newProduct = newProduct.toJSON();
  newProduct.images = images;
  newProduct.tags = addedTags;

  res.status(201).json(new ApiResponse(201, newProduct, message));
});

// Get all products
export const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const { product_name, category_id, tags } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (product_name) {
      whereClause[Op.or] = [];
      if (product_name) {
        whereClause[Op.or].push({
          product_name: { [Op.iLike]: `%${product_name}%` },
        });
      }
      if (isNumber(product_name)) {
        whereClause[Op.or].push({ ws_code: { [Op.eq]: product_name } });
      }
    }

    if (category_id) {
      whereClause.category_id = { [Op.eq]: category_id };
    }

    if (tags) {
      let Tag_Ids = Array.isArray(tags) ? tags : [tags];
      const productTags = await ProductTags.findAll({
        where: { tag_id: { [Op.in]: Tag_Ids } },
        attributes: ["product_id"],
      });

      const productIds = [
        ...new Set(productTags.map((productTag) => productTag.product_id)),
      ];

      whereClause.product_id = { [Op.in]: productIds };
    }

    whereClause.is_Deleted = { [Op.eq]: false };

    const { rows: products, count: totalItems } = await Product.findAndCountAll(
      {
        where: whereClause,
        limit,
        offset,
      }
    );

    const totalPages = Math.ceil(totalItems / limit);

    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const image = await ProductImages.findOne({
          where: { product_id: product.product_id },
          attributes: ["image_id", "url"],
        });

        return {
          ...product.toJSON(),
          image: image ? { id: image.image_id, url: image.url } : null,
        };
      })
    );

    // Return response
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          products: productsWithImages,
          totalItems,
          totalPages,
          currentPage: page,
        },
        "Products Retrieved Successfully"
      )
    );
  } catch (error) {
    console.error("Error retrieving products:", error);
  }
});

// Get a single product by ID
// export const getProductByWsCode = asyncHandler(async (req, res) => {
//   const { WsCode } = req.params;
//   let product = await Product.findOne({ where: { ws_code: WsCode } });

//   if (!product) {
//     res.status(404).json(new ApiResponse(404, null, "Product Not Found"));
//     throw new ApiError("Product Not Found");
//   }

//   const Product_Images = await ProductImages.findAll({
//     where: { product_id: product.product_id },
//   });

//   const images = Product_Images.map((image) => {
//     return { id: image.image_id, url: image.url };
//   });

//   let Tags = await ProductTags.findAll({
//     where: { product_id: product.product_id },
//   });

//   Tags = Tags.map((tag) => tag.tag_id);

//   product = product.toJSON();
//   product.images = images;
//   product.tags = Tags;

//   res
//     .status(200)
//     .json(new ApiResponse(200, product, "Product Retrieved Successfully"));
// });

// Update a product by ID
export const updateProduct = asyncHandler(async (req, res) => {
  const { WsCode } = req.params;
  const { product_name, price, package_size, category_id, tags } = req.body;

  const product = await Product.findOne({ where: { ws_code: WsCode } });

  if (!product) {
    res.status(404).json(new ApiResponse(404, null, "Product Not Found"));
    throw new ApiError("Product Not Found");
  }

  product.product_name = product_name;
  product.price = parseFloat(price);
  product.package_size = parseInt(package_size);
  product.category_id = category_id;

  
  let addedTags = [];
  if (Array.isArray(tags) && tags.length > 0) {
    const currentTags = await ProductTags.findAll({
      where: { product_id: product.product_id },
    });
    console.log(tags);
    for (let tag of currentTags) {
      console.log(tag.tag_id);
      if (!tags.includes(tag.tag_id)) {
        await tag.destroy();
      }
    }
  
    console.log(tags);
    try {
      const tagPromises = tags.map(async (tag_id) => {
        const tag = await Tag.findByPk(tag_id);
        if (!tag) {
          message += `\nTag with ID ${tag_id} not found.`;
          return Promise.resolve();
        }
        const productTag = await ProductTags.findOne({
          where: { product_id: product.product_id, tag_id },
        });
        if (productTag) {
          return Promise.resolve();
        }
        addedTags.push(tag.tag_id);
        return ProductTags.create({
          product_id: product.product_id,
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

  await product.save();

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product Updated Successfully"));
});

export const updateProductImage = asyncHandler(async (req, res) => {
  const { currentImageId } = req.body;
  const newImage = req.file;
  console.log(req.file);

  if (!newImage) {
    res.status(400).json(new ApiResponse(400, null, "Image is required"));
    throw new ApiError("Image is required");
  }

  const image = await ProductImages.findOne({
    where: { image_id: currentImageId },
  });

  if (!image) {
    res.status(404).json(new ApiResponse(404, null, "Image Not Found"));
    throw new ApiError("Image Not Found");
  }

  const currentImageUrl = image.url;
  const newImageUrl = await uploadOnCloudinary(newImage.path);
  image.url = newImageUrl.secure_url;
  await image.save();

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

  const images = await ProductImages.findAll({
    where: { product_id: product.product_id },
  });

  if (!product) {
    return res.status(404).json(new ApiResponse(404, null, "Product Not Found"));
    // throw new ApiError("Product Not Found");
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
    images.map((image) => deleteFromCloudinary(image.url))
  );

  await Promise.all(
    images.map((image) => image.destroy())
  )

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

  // const currentImageUrls = await ProductImages.findAll({
  //   where: { product_id: product.product_id },
  // });

  // await Promise.all(
  //   currentImageUrls.map(async (image) => {
  //     await deleteFromCloudinary(image.url);
  //   })
  // );

  // await product.destroy();
  product.is_Deleted = true;
  await product.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Product Deleted Successfully"));
});

export const searchProducts = asyncHandler(async (req, res) => {
  try {
    const { product_name, category_id, tags } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (product_name) {
      whereClause[Op.or] = [];
      if (product_name) {
        whereClause[Op.or].push({
          product_name: { [Op.iLike]: `%${product_name}%` },
        });
      }
      if (isNumber(product_name)) {
        whereClause[Op.or].push({ ws_code: { [Op.eq]: product_name } });
      }
    }

    if (category_id) {
      whereClause.category_id = { [Op.eq]: category_id };
    }

    if (tags) {
      let Tag_Ids = Array.isArray(tags) ? tags : [tags];
      const productTags = await ProductTags.findAll({
        where: { tag_id: { [Op.in]: Tag_Ids } },
        attributes: ["product_id"],
      });

      const productIds = [
        ...new Set(productTags.map((productTag) => productTag.product_id)),
      ];

      whereClause.product_id = { [Op.in]: productIds };
    }

    const { rows: products, count: totalItems } = await Product.findAndCountAll(
      {
        where: whereClause,
        limit,
        offset,
      }
    );

    const totalPages = Math.ceil(totalItems / limit);

    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const image = await ProductImages.findOne({
          where: { product_id: product.product_id },
          attributes: ["image_id", "url"],
        });

        return {
          ...product.toJSON(),
          image: image ? { id: image.image_id, url: image.url } : null,
        };
      })
    );

    // Return response
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          products: productsWithImages,
          totalItems,
          totalPages,
          currentPage: page,
        },
        "Products Retrieved Successfully"
      )
    );
  } catch (error) {
    console.error("Error retrieving products:", error);
  }
});

// export const getProductsByCategory = asyncHandler(async (req, res) => {
//   try {
//     const categories = await Category.findAll();
//     const productsByCategory = await Promise.all(
//       categories.map(async (category) => {
//         const products = await Product.findAll({
//           where: { category_id: category.id },
//           limit: 5,
//         });
//         return {
//           category: category.name,
//           products,
//         };
//       })
//     );

//     res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           productsByCategory,
//           "Products by category retrieved successfully"
//         )
//       );
//   } catch (error) {
//     console.error("Error fetching products by category:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching products by category" });
//   }
// });

export const getImagesTagsByProductId = asyncHandler(async (req, res) => {
  const { product_id } = req.params;

  const images = await ProductImages.findAll({
    where: { product_id },
  });

  let tags = await ProductTags.findAll({
    where: { product_id },
  });

  tags = tags.map((tag) => tag.tag_id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { images, tags }, "Images Retrieved Successfully")
    );
});