import { SERVER_URL } from "../../constants";
import axios from "axios";

const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
});

// User Api Calls

export const registerUserAPI = (userData) => api.post("/user", userData);
export const loginUserAPI = (credentials) => api.post("/user/login", credentials);
export const updateUserAPI = (userData) =>
  api.post("/user/update", userData);
export const logoutUserAPI = (token) =>
  api.post("/user/logout");

export const getProducts = (page=1,limit=10) => api.get(`/product?page=${page}&limit=${limit}`);
export const searchProducts = (search) => api.get(`/product/search`, {
  params: { product_name: search },
});

export const getCartAPI = () => api.get("/cart");
export const addToCartAPI = ( product_id ) => api.post("/cart/add", {product_id});
export const removeFromCartAPI = (cart_item_id) => api.delete(`/cart/remove/${cart_item_id}`);
export const updateCartAPI = (cart_item_id, quantity) => api.put(`/cart/update`, {cart_item_id, quantity});


export const placeOrderAPI = (data) => api.post("/order");


export const getOrdersAPI = () => api.get("/order");


export const createProduct = (data) => api.post("/product", data);

export const getTagsAPI = () => api.get("/tag");
export const createTagAPI = (tag) => api.post("/tag", tag);

export const getAllOrdersAPI = (page = 1, limit = 10) => api.get(`/order/all?page=${page}&limit=${limit}`);
export const updateOrderStatusAPI = (id, status) =>
  api.put(`/orders/${id}`, { status });