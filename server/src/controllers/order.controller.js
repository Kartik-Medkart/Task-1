import { models } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {Op} from 'sequelize'
import { sendMessage } from "../services/message.services.js";
import { newOrder, receiveOrder } from "../utils/MessageBody.js";


const { Order, Cart, CartItem, User } = models;

export const createOrder = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const cart_id = req.user?.cart_id;

  const user = await User.findByPk(user_id);

  if (!cart_id) {
    return res.status(400).json(new ApiResponse(400, null, "Cart is empty"));
  }

  if(!user.address || !user.city || !user.state){
    return res.status(400).json(new ApiResponse(400, null, "Please update your address"));
  }

  const cart = await Cart.findByPk(cart_id);

  const order = await Order.create({
    user_id,
    cart_id,
    total_amount: cart.amount,
  });

  user.cart_id = null;
  await user.save();

  // Update order_id in CartItem
  await CartItem.update({ order_id: order.order_id }, { where: { cart_id } });
  let orderItems = await CartItem.findAll({ where: { cart_id } });

  orderItems = orderItems.map((item) => item.toJSON());

  let orderItemsNames = orderItems.map((item) => item.name);
  orderItemsNames = orderItemsNames.join(", ");
  // Send order confirmation message
  try{
    // console.log(user.phone, `${user.firstName} ${user.lastName}`, order.order_id, new Date(order.shipping_date).toISOString())
    // await sendMessage(newOrder(user.phone, `${user.firstName} ${user.lastName}`, order.order_id, new Date(order.shipping_date).toISOString()));
    console.log(order.order_id, `${user.firstName} ${user.lastName}`, orderItemsNames, cart.amount)
    await sendMessage(receiveOrder(order.order_id, `${user.firstName} ${user.lastName}`, orderItemsNames, cart.amount));
  }
  catch(err){
    console.log(err);
  }

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

  const orders = await Order.findAll({
    where: { user_id },
    include: [
      {
        model: Cart,
        as : "cart",
        attributes: ["cart_id", "amount"],
        include: {
          model: CartItem,
          as: "items",
          attributes: ["cart_item_id", "name", "image", "quantity", "price"],
        },
      },
    ],
  });

  res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

// Delete order
export const deleteOrder = asyncHandler(async (req, res) => {
  const { order_id } = req.params;

  const order = await Order.findByPk(order_id);

  if (!order) {
    res.status(404).json(new ApiResponse(404, null, "Order not found"));
    throw new ApiError(404, "Order not found");
  }

  await order.destroy();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Order deleted successfully"));
});

// Admin Controllers

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
          as : "cart",
          attributes: ["cart_id", "amount"],
          include: {
            model: CartItem,
            as: "items",
            attributes: ["cart_item_id", "name", "image", "quantity", "price"],
          },
        },
        {
          model: User,
          as: "user",
          attributes: ["username", "email", "phone", "address", "city", "state"],
          where: {
            role: {
              [Op.ne]: req.user.role
            }
          }
        }
      ],
    });
  
    const totalPages = Math.ceil(count / limit);
    console.log(count)
  
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
  if(status === "delivered"){
    order.delivered_date = new Date();
  }
  await order.save();

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order updated successfully"));
});
