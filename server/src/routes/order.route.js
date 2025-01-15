import express from 'express';
import { createOrder, getOrdersByUser, getOrderById, deleteOrder, updateOrderStatus, getAllOrders } from '../controllers/order.controller.js';
import { restrict, verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(verifyJWT);

// Create a new order
router.post('/', createOrder);

// Get all orders
router.get('/', getOrdersByUser);

router.get('/all', restrict(["admin"]), getAllOrders);

// Get order by ID
router.get('/:order_id', getOrderById);

// Update order
router.put('/:order_id', restrict(["admin"]), updateOrderStatus);

// Delete order
router.delete('/:order_id', restrict(["admin"]), deleteOrder);

export default router;