import { models } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const { Product, Category } = models;

function isNumber(value) {
    return /^-?\d*(\.\d+)?$/.test(value);
  }

export const validateProduct = asyncHandler(async (req, res, next) => {
  try {
    let { product_name, ws_code, price, package_size, category_id, tags, message } = req.body;
    if (!product_name || !ws_code || !price || !package_size || !category_id) {
      console.log(product_name, ws_code, price, package_size, category_id);
      res
        .status(400)
        .json(new ApiResponse(400, [], "Please provide all required fields"));
    }

    const validations = {};

    if (/^\d+$/.test(product_name)) {
      validations.product_name = "Product Name should not be a number";
    }

    ws_code = parseInt(ws_code);
    package_size = parseInt(package_size);
    price = parseFloat(price);
    console.log(ws_code);

    if (!isNumber(ws_code) || ws_code < 0) {
      validations.ws_code = "WS Code should be a positive number";
    }

    if (!isNumber(price) || price < 0) {
      validations.price = "Price should be a positive number";
    }

    if (!isNumber(package_size) || package_size < 0) {
        validations.package_size = "Package Size should be a positive number";
    }

    if (!Array.isArray(tags) && tags) {
      tags = [tags];
    }

    const product = await Product.findOne({ where: { ws_code } });

    if (product) {
      validations.ws_code = "Product with this WS Code already exists";
    }

    const category = await Category.findByPk(category_id);

    if (!category) {
      validations.category = "Category Does Not Exist.";
    }

    if (Object.keys(validations).length > 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, validations, "Validation Error"));
    }

    req.values = { product_name, ws_code, price, package_size, category_id, tags, message };
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiResponse(500, [], "Internal Server Error"));
  }
});
