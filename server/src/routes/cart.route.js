import express from 'express';
import { addToCart, 
    // updateCartItem, 
    removeFromCart, getCart, 
    updateQuantity} from '../controllers/cart.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(verifyJWT);

// Get Cart Details
router.get('/', getCart);

router.post('/add', addToCart);

// Add/Update Item in Cart
router.post('/update', updateQuantity);

// Remove Item from Cart
router.delete('/remove', removeFromCart);

export default router;