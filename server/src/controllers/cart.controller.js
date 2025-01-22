import { models } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { parse } from "path";

const { Cart, CartItem, Product, User, ProductImages } = models;

export const addToCart = asyncHandler(async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const user_id = req.user.user_id;

    const product = await Product.findByPk(product_id);

    if (!product || product.is_deleted) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Product with this id does not exist")
        );
      // throw new ApiError(400, "Product with this id does not exist");
    }

    const user = await User.findByPk(user_id);

    if (!user) {
      res.status(400).json(new ApiResponse(400, null, "User does not exist"));
      throw new ApiError(400, "User does not exist");
    }

    let cart;

    if (req.user?.cart_id) {
      cart = await Cart.findByPk(req.user?.cart_id);
    } else {
      cart = await Cart.create({
        user_id,
      });

      user.cart_id = cart.cart_id;
      await user.save();
    }

    const item = await CartItem.findOne({
      where: { cart_id: cart.cart_id, product_id },
    });

    if (item) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Product already in Cart"));
    }

    const image = await ProductImages.findOne({ where: { product_id } });

    let cartItem = await CartItem.create({
      cart_id: user.cart_id,
      product_id,
      quantity,
    });

    cart.amount =
      parseFloat(cart.amount) + parseFloat(product.price) * quantity;
    console.log(cart.amount);
    await cart.save();

    cartItem = {
      cart_item_id: cartItem.cart_item_id,
      cart_id: user.cart_id,
      product_id,
      name: product.product_name,
      price: product.price,
      image: image?.url || "",
      quantity,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { item: cartItem, amount: cart.amount },
          "Product Added to Cart"
        )
      );
  } catch (error) {
    console.log(error);
  }
});

export const updateQuantity = asyncHandler(async (req, res) => {
  try {
    const { cart_item_id, quantity } = req.body;
    const user_id = req.user.user_id;

    const cartItem = await CartItem.findByPk(cart_item_id);

    if (!cartItem) {
      res
        .status(400)
        .json(new ApiResponse(400, null, "Cart Item does not exist"));
      // throw new ApiError(400, "Cart Item does not exist");
    }

    const cart = await Cart.findByPk(cartItem.cart_id);

    if (cart.user_id !== user_id) {
      res
        .status(400)
        .json(new ApiResponse(400, null, "Cart Item does not belong to User"));
      // throw new ApiError(400, "Cart Item does not belong to User");
    }

    const product = await Product.findByPk(cartItem.product_id);

    if (!product || product.is_deleted) {
      res
        .status(400)
        .json(new ApiResponse(400, null, "Product does not exist"));
      throw new ApiError(400, "Product does not exist");
    }

    // Add Functionality to check if product is in stock
    // Add Functionality to verify that product details is changed or not?

    const oldQuantity = cartItem.quantity;
    const pricePerItem = parseFloat(product.price);
    const quantityDifference = quantity - oldQuantity;

    cart.amount =
      parseFloat(cart.amount) + parseFloat(quantityDifference * pricePerItem);
    cartItem.quantity = quantity;

    cart.amount = parseFloat(cart.amount.toFixed(2));

    await cartItem.save();
    await cart.save();

    return res.status(200).json(new ApiResponse(200, cart, "Quantity Updated"));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiResponse(500, [], "Internal Server Error"));
  }
});

export const removeFromCart = asyncHandler(async (req, res) => {
  try {
    const { cart_item_id } = req.params;
    const user_id = req.user.user_id;

    const cartItem = await CartItem.findByPk(cart_item_id);

    if (!cartItem) {
      res
        .status(400)
        .json(new ApiResponse(400, [], "Cart Item does not exist"));
      throw new ApiError(400, "Cart Item does not exist");
    }

    const cart = await Cart.findByPk(cartItem.cart_id);

    if (cart.user_id !== user_id) {
      res
        .status(400)
        .json(new ApiResponse(400, [], "Cart Item does not belong to User"));
      throw new ApiError(400, "Cart Item does not belong to User");
    }

    const product = await Product.findByPk(cartItem.product_id);

    await cartItem.destroy();
    cart.amount =
      parseFloat(cart.amount) - parseFloat(product.price) * cartItem.quantity;
    cart.amount = parseFloat(cart.amount.toFixed(2));

    if(cart.amount < 0){
      cart.amount = 0;
    }

    await cart.save();

    return res
      .status(200)
      .json(new ApiResponse(200, cart, "Product Removed from Cart"));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiResponse(500, [], "Internal Server Error"));
  }
});

export const getCart = asyncHandler(async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const user = await User.findByPk(user_id);

    if (!user) {
      res.status(400).json(new ApiResponse(400, [], "User does not exist"));
      throw new ApiError(400, "User does not exist");
    }

    let cart = await Cart.findByPk(user.cart_id, {
      include: {
        model: CartItem,
        as: "items",
        attributes: ["cart_item_id", "product_id", "quantity"],
        include: {
          model: Product,
          as: "product",
          attributes: ["product_name", "price"],
          include: {
            model: ProductImages,
            as: "images",
            attributes: ["url"],
          },
        },
      },
    });

    if (cart) {
      cart = cart.toJSON();
      cart.items = cart.items.map((item) => ({
        cart_item_id: item.cart_item_id,
        product_id: item.product_id,
        quantity: item.quantity,
        name: item.product.product_name,
        price: item.product.price,
        image:
          item.product.images.length > 0 ? item.product.images[0].url : null,
      }));
    } else {
      cart = [];
    }

    return res
      .status(200)
      .json(new ApiResponse(200, cart, "Cart Items Fetched"));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiResponse(500, [], "Internal Server Error"));
  }
});
