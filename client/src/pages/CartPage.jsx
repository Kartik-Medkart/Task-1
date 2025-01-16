import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-toastify";
import { placeOrderAPI } from "../services/api";

const CartPage = () => {

  const { cartItems, addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalQuantity,
    totalPrice } = useCart();

  const placeOrder = async() => {
    try {
        const response = await placeOrderAPI();
        const { data, success, message } = response.data;
        if (success) {
          toast.success(message);
          clearCart();
        } else {
          toast.error(message);
        }
    } catch (error) {
      console.error("Error placing order: ", error);
        
    }
  }

  const handleIncrement = (id, prevQuantity) => {
    updateQuantity(id, prevQuantity + 1);
  };

  const handleDecrement = (id, prevQuantity) => {
    updateQuantity(id, Math.max(prevQuantity - 1, 1));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const CartItem = ({ id, item }) => (
    <div className="flex flex-col md:flex-row items-center justify-between p-4 mb-4 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row items-center md:space-x-4 mb-4 md:mb-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-24 h-24 object-cover rounded-lg"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1595246140608-21d37b3dc2e8";
          }}
        />
        <h3 className="text-lg font-semibold text-gray-800 mt-2 md:mt-0">{item.name}</h3>
      </div>
      
      <div className="flex flex-col md:flex-row items-center md:space-x-8">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDecrement(id, item.quantity)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
          >
            <FaMinus />
          </button>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => updateQuantity(id, e.target.value)}
            className="w-16 text-center border rounded-md p-1"
          />
          <button
            onClick={() => handleIncrement(id, item.quantity)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
          >
            <FaPlus />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <p className="text-lg font-semibold text-gray-800">
            ${(item.price * item.quantity).toFixed(2)}
          </p>
          <button
            onClick={() => removeFromCart(id)}
            className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
          >
            <FiTrash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cartItems.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-600 text-lg">Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item, index) => <CartItem key={index} id={item.cart_item_id} item={item} />)
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={cartItems.length === 0}
              onClick={() => placeOrder()}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;