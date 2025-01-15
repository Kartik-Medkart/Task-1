import { SERVER_URL } from "../../constants";
import axios from "axios";

const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
});

// User Api Calls

export const registerUser = (userData) => api.post("/user", userData);
export const loginUser = (credentials) => api.post("/user/login", credentials);
export const updateUser = (userData, token) =>
  api.put("/user/update", userData, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token}`,
    },
  });
export const logoutUser = (token) =>
  api.post("/user/logout", null, {
    headers: {
      Cookie: `token=${token}`,
    },
  });

export const getProducts = (page=1,limit=10) => api.get(`/product?page=${page}&limit=${limit}`);
export const createProduct = (data) => api.post("/product", data);


export const getOrders = () => api.get("/orders");
export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}`, { status });
