import { getCartAPI, addToCartAPI, updateCartAPI, removeFromCartAPI } from "../services/api/index";
import React, {useEffect, createContext, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return {
        ...state,
        cartItems: action.payload.cartItems,
        totalPrice: action.payload.totalPrice,
      };
    case "ADD_TO_CART":
      return {
        ...state,
        cartItems: [...state.cartItems, { ...action.payload.item }],
      };
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter((item) => item.cart_item_id !== action.payload),
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.cart_item_id === action.payload.id
            ? { ...item, quantity: action.payload.updateFn(item.quantity) }
            : item
        ),
      };
    case "CLEAR_CART":
      return { ...state, cartItems: [], totalPrice: 0, totalQuantity: 0 };
    default:
      return state;
  }
};

const initialState = {
  cartItems: [],
  totalQuantity: 0,
  totalPrice: 0,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const {isAuthenticated, logout} = useAuth();

  useEffect(() => {
    if(!isAuthenticated) return;
    const fetchCart = async () => {
      try {
        const response = await getCartAPI();
        const { data, success, message } = response;
        if (success) {
          // toast.success(message);
          dispatch({
            type: "SET_CART",
            payload: { cartItems: data?.items || [], totalPrice: data?.amount || 0 },
          });
        }
      } catch (error) {
        logout();
        console.error("Error adding to cart: ", error);
      }
    };
    fetchCart();
  }, [isAuthenticated]);

  console.log("Cart State: ", state);

  const addToCart = async (product, quantity = 1) => {
    const existingItem = state.cartItems.find(
      (item) => item.product_id === product.product_id
    );
    if (existingItem) {
      toast.error("Product already in cart");
      return state;
    }
    try {
      const response = await addToCartAPI(product.product_id);
      const { data, success, message } = response;
      if (success) {
        toast.success(message);
        dispatch({ type: "ADD_TO_CART", payload: { item: data.item } });
      }
    } catch (error) {
      console.error("Error adding to cart: ", error);
    }
  };

  const removeFromCart = async(id) => {
    try {
      const response = await removeFromCartAPI(id);
      const { data, success, message } = response;
      console.log(data);
      if (success) {
        toast.success(message);
        dispatch({ type: "REMOVE_FROM_CART", payload: id });
      }
    } catch (error) {
      console.error("Error adding to cart: ", error);
    }
  }

  const updateQuantity = async(id, quantity) =>{
    try {
      const response = await updateCartAPI(id, quantity);
      const { data, success, message } = response;
      console.log(data);
      if (success) {
        toast.success(message);
        dispatch({
          type: "UPDATE_QUANTITY",
          payload: { id, updateFn: (prev) => quantity },
        });
      }
    } catch (error) {
      console.error("Error adding to cart: ", error);
    }
  }
    
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const totalQuantity = state.cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = state.cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
