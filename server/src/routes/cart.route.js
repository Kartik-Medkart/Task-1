import express from 'express';
import { addToCart, 
    // updateCartItem, 
    removeFromCart, getCart, 
    updateQuantity} from '../controllers/cart.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.get('/', verifyJWT, getCart);

router.post('/add', verifyJWT, addToCart);


router.put('/update', verifyJWT, updateQuantity);


router.delete('/remove/:cart_item_id', verifyJWT, removeFromCart);

export default router;