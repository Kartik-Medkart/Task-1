import { models } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Op } from "sequelize";
import { sendMessage } from "../services/message.services.js";
import { newOrder, receiveOrder } from "../utils/MessageBody.js";

const { Order, Cart, CartItem, User, Product, ProductImages } = models;

export const createOrder = asyncHandler(async (req, res) => {
  const { user_id } = req.user;

  const user = await User.findByPk(user_id);

  const { cart_id } = user;

  if (!user.cart_id) {
    return res.status(400).json(new ApiResponse(400, [], "Cart is empty"));
  }

  if (!user.address || !user.city || !user.state) {
    return res
      .status(400)
      .json(new ApiResponse(400, [], "Please update your address"));
  }

  const cart = await Cart.findByPk(cart_id);

  const order = await Order.create({
    user_id,
    cart_id,
  });

  user.cart_id = null;
  await user.save();

  let orderItems = await CartItem.findAll({
    where: { cart_id },
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
  });

  orderItems = orderItems.map((item) => item.toJSON());
  orderItems = orderItems.map((item) => ({
    cart_item_id: item.cart_item_id,
    product_id: item.product_id,
    quantity: item.quantity,
    name: item.product.product_name,
    price: item.product.price,
    image: item.product.images[0].url,
  }));

  console.log(orderItems);

  // orderItems = orderItems.map((item) => item.toJSON());

  // let orderItemsNames = orderItems.map((item) => item.name);
  // orderItemsNames = orderItemsNames.join(", ");
  // // Send order confirmation message
  // try{
  //   // console.log(user.phone, `${user.firstName} ${user.lastName}`, order.order_id, new Date(order.shipping_date).toISOString())
  //   // await sendMessage(newOrder(user.phone, `${user.firstName} ${user.lastName}`, order.order_id, new Date(order.shipping_date).toISOString()));
  //   console.log(order.order_id, `${user.firstName} ${user.lastName}`, orderItemsNames, cart.amount)
  //   await sendMessage(receiveOrder(order.order_id, `${user.firstName} ${user.lastName}`, orderItemsNames, cart.amount));
  // }
  // catch(err){
  //   console.log(err);
  // }

  return res
    .status(201)
    .json(
      new ApiResponse(201, { order, orderItems }, "Order created successfully")
    );
});

// Get order by ID
export const getOrderById = asyncHandler(async (req, res) => {
  const { order_id } = req.params;

  const order = await Order.findByPk(order_id, {
    include: [
      {
        model: Cart,
        attributes: ["cart_id", "amount"],
        include: {
          model: CartItem,
          as: "items",
          attributes: ["cart_item_id", "name", "image", "quantity", "price"],
        },
      },
      {
        model: User,
        attributes: ["username", "email"],
      },
    ],
  });

  if (!order) {
    res.status(404).json(new ApiResponse(404, null, "Order not found"));
    throw new ApiError(404, "Order not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order retrieved successfully"));
});

export const getOrdersByUser = asyncHandler(async (req, res) => {
  const { user_id } = req.user;

  let orders = await Order.findAll({
    where: { user_id },
    include: [
      {
        model: Cart,
        as: "cart",
        attributes: ["cart_id", "amount"],
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
      },
    ],
  });

  orders = orders.map((order) => order.toJSON());
  console.log(orders);
  orders = orders.map((order) => {
    order.cart.items = order.cart.items.map((item) => {
      return {
        cart_item_id: item.cart_item_id,
        product_id: item.product_id,
        quantity: item.quantity,
        name: item.product.product_name,
        price: item.product.price,
        image: item.product.images[0].url,
      };
    });
    return order;
  });

  res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

// Delete order
export const cancelOrder = asyncHandler(async (req, res) => {
  const { order_id } = req.params;

  const order = await Order.findByPk(order_id);

  if (!order) {
    res.status(404).json(new ApiResponse(404, null, "Order not found"));
    throw new ApiError(404, "Order not found");
  }

  order.order_status = "cancelled";
  await order.save();

  res
    .status(200)
    .json(new ApiResponse(200, [], "Order deleted successfully"));
});

// Get all orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let { count, rows: orders } = await Order.findAndCountAll({
    limit: Number(limit),
    offset: Number(offset),
    include: [
      {
        model: Cart,
        as: "cart",
        attributes: ["cart_id", "amount"],
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
      },
      {
        model: User,
        as: "user",
        attributes: ["username", "email", "phone", "address", "city", "state"],
        where: {
          role: {
            [Op.ne]: req.user.role,
          },
        },
      },
    ],
  });

  orders = orders.map((order) => order.toJSON());
  console.log(orders);
  orders = orders.map((order) => {
    order.cart.items = order.cart.items.map((item) => {
      return {
        cart_item_id: item.cart_item_id,
        product_id: item.product_id,
        quantity: item.quantity,
        name: item.product.product_name,
        price: item.product.price,
        image: item.product.images[0].url,
      };
    });
    return order;
  });

  console.log(orders)

  const totalPages = Math.ceil(count / limit);
  console.log(count);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        totalItems: count,
        totalPages,
        currentPage: Number(page),
      },
      "Orders retrieved successfully"
    )
  );
});

// Update order
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;

  const order = await Order.findByPk(order_id);

  if (!order) {
    res.status(404).json(new ApiResponse(404, null, "Order not found"));
    throw new ApiError(404, "Order not found");
  }

  order.order_status = status;
  if (status === "delivered") {
    order.delivered_date = new Date();
  }
  await order.save();

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order updated successfully"));
});
