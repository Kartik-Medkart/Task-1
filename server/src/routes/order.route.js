import express from 'express';
import { createOrder, getOrdersByUser, getOrderById, deleteOrder, updateOrderStatus, getAllOrders } from '../controllers/order.controller.js';
import { restrict, verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all routes after this middleware

// Create a new order
router.post('/', verifyJWT, createOrder);

// Get all orders
router.get('/', verifyJWT, getOrdersByUser);

router.get('/all', verifyJWT, restrict(["admin", "superadmin"]), getAllOrders);

// Get order by ID
router.get('/:order_id', verifyJWT, getOrderById);

// Update order
router.put('/:order_id', verifyJWT, restrict(["admin", "superadmin"]), updateOrderStatus);

// Delete order
router.delete('/:order_id', verifyJWT, restrict(["admin", "superadmin"]), deleteOrder);

export default router;