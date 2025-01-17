import { SERVER_URL } from "../../constants";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import { toast } from "react-toastify";


const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response.data;
  },
  (error) => {
    if (error.config && error.config.headers['Bypass-Interceptor']) {
      return Promise.reject(error);
    }

    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const { response } = error;
    if (response) {
      // Handle specific status codes
      switch (response.status) {
        case 400:
          toast.error(response?.data?.message || "Bad Request");
          break;
        case 401:
          localStorage.removeItem('user');
          toast.error(response?.data?.message || "Unauthorized");
          break;
        case 403:
          toast.error(response?.data?.message || "Forbidden");
          break;
        case 404:
          toast.error(response?.data?.message || "Not Found");
          break;
        case 500:
          toast.error(response?.data?.message || "Internal Server Error");
          break;
        default:
          toast.error(response?.data?.message || "An unexpected error occurred");
      }
    } else {
      // Handle network errors
      toast.error("Network Error. Please check your internet connection.");
    }
    return Promise.reject(error);
  }
);


// User Api Calls

export const registerUserAPI = (userData) => api.post("/user", userData);
export const loginUserAPI = (credentials) => api.post("/user/login", credentials);
export const updateUserAPI = (userData) =>
  api.post("/user/update", userData);
export const logoutUserAPI = (token) =>
  api.post("/user/logout");


// Product Api Calls

export const getProducts = (page=1,limit=10) => api.get(`/product?page=${page}&limit=${limit}`);
export const searchProducts = (search) => api.get(`/product/search`, {
  params: { product_name: search },
});

// Cart Api Calls

export const getCartAPI = () => api.get("/cart");
export const addToCartAPI = ( product_id ) => api.post("/cart/add", {product_id});
export const removeFromCartAPI = (cart_item_id) => api.delete(`/cart/remove/${cart_item_id}`);
export const updateCartAPI = (cart_item_id, quantity) => api.put(`/cart/update`, {cart_item_id, quantity});

// Order Api Calls

export const placeOrderAPI = (data) => api.post("/order");
export const getOrdersAPI = () => api.get("/order");

export const getAllOrdersAPI = (page = 1, limit = 10) => api.get(`/order/all?page=${page}&limit=${limit}`);
export const updateOrderStatusAPI = (id, status) =>
  api.put(`/orders/${id}`, { status });

// Product Api Calls

export const createProduct = (data) => api.post("/product", data);

export const getCategoriesAPI = () => api.get("/category");

export const getTagsAPI = () => api.get("/tag");
export const createTagAPI = (tag) => api.post("/tag", tag);
