import { models } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { parse } from "path";

const { Cart, CartItem, Product, User, ProductImages } = models;

export const addToCart = asyncHandler(async (req, res) => {
    const { product_id, quantity = 1 } = req.body;
    const user_id = req.user.user_id;
    console.log(req.user);
    
    const product = await Product.findByPk(product_id);
    
    if (!product) {
        res
        .status(400)
        .json(new ApiResponse(400, null, "Product with this id does not exist"));
        throw new ApiError(400, "Product with this id does not exist");
    }

    const user = await User.findByPk(user_id);

    if(!user){
        res.status(400).json(new ApiResponse(400, null, "User does not exist"));
        throw new ApiError(400, "User does not exist");
    }

    let cart;

    if(req.user?.cart_id){
        cart = await Cart.findByPk(req.user?.cart_id);
    }
    else{
        cart = await Cart.create({
            user_id
        });

        user.cart_id = cart.cart_id;
        await user.save();
    }

    const item = await CartItem.findOne({where: {cart_id: cart.cart_id, product_id}});

    if(item){
       return res.status(400).json(new ApiResponse(400, null, "Product already in Cart"));
    }

    const image = await ProductImages.findOne({where: {product_id}});
    
    const cartItem = await CartItem.create({
        cart_id:  user.cart_id,
        product_id,
        name: product.product_name,
        price: product.price,
        image: image.url,
        quantity,
    });

    cart.amount += Number(product.price) * quantity;
    await cart.save();

    // const newCart = await Cart.findByPk(cart.cart_id, {
    //     include: {
    //         model: CartItem,
    //         as: 'items',
    //         attributes: ['cart_item_id','name', 'image', 'quantity', 'price']
    //     },
    // });
    
    return res.status(200).json(new ApiResponse(200, {item : cartItem , amount: cart.amount}, "Product Added to Cart"));
});

export const updateQuantity = asyncHandler(async (req, res) => {
    const { cart_item_id, quantity } = req.body;
    const user_id = req.user.user_id;

    const cartItem = await CartItem.findByPk(cart_item_id);

    if(!cartItem){
        res.status(400).json(new ApiResponse(400, null, "Cart Item does not exist"));
        throw new ApiError(400, "Cart Item does not exist");
    }

    const cart = await Cart.findByPk(cartItem.cart_id);

    if(cart.user_id !== user_id){
        res.status(400).json(new ApiResponse(400, null, "Cart Item does not belong to User"));
        throw new ApiError(400, "Cart Item does not belong to User");
    }

    const product = await Product.findByPk(cartItem.product_id);

    if(!product){
        res.status(400).json(new ApiResponse(400, null, "Product does not exist"));
        throw new ApiError(400, "Product does not exist");
    }

    // Add Functionality to check if product is in stock
    // Add Functionality to verify that product details is changed or not?

    const oldQuantity = cartItem.quantity;
    const pricePerItem = parseFloat(cartItem.price);
    const quantityDifference = quantity - oldQuantity;

    cart.amount += quantityDifference * pricePerItem;
    cartItem.quantity = quantity;

    await cartItem.save();
    await cart.save();

    return res.status(200).json(new ApiResponse(200, cart, "Quantity Updated"));
});

export const removeFromCart = asyncHandler(async (req, res) => {
    const { cart_item_id } = req.params;
    const user_id = req.user.user_id;

    const cartItem = await CartItem.findByPk(cart_item_id);
    
    if(!cartItem){
        res.status(400).json(new ApiResponse(400, null, "Cart Item does not exist"));
        throw new ApiError(400, "Cart Item does not exist");
    }

    const cart = await Cart.findByPk(cartItem.cart_id);

    if(cart.user_id !== user_id){
        res.status(400).json(new ApiResponse(400, null, "Cart Item does not belong to User"));
        throw new ApiError(400, "Cart Item does not belong to User");
    }

    await cartItem.destroy();
    cart.amount -= parseFloat(cartItem.price) * cartItem.quantity;

    await cart.save();

    return res.status(200).json(new ApiResponse(200, cart, "Product Removed from Cart"));
})

export const getCart = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;

    const user = await User.findByPk(user_id);

    if(!user){
        res.status(400).json(new ApiResponse(400, null, "User does not exist"));
        throw new ApiError(400, "User does not exist");
    }

    const cart = await Cart.findByPk(user.cart_id, {
        include: {
            model: CartItem,
            as: 'items',
            attributes: ['cart_item_id','product_id','name', 'image', 'quantity', 'price'],
            // include: {
            //     model: Product,
            //     as: 'product',
            //     attributes: ['ws_code']
            // }
        },
    });

    return res.status(200).json(new ApiResponse(200, cart, "Cart Items Fetched"));
});