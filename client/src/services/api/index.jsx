import { SERVER_URL } from "../../constants";
import axios from "axios";
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
          if(window.location.pathname !== '/login') window.location.href = '/login';
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
export const logoutUserAPI = () =>
  api.post("/user/logout");

export const sentOtpAPI = (phone) => api.post("/user/send-otp", { phone });
export const verifyOtpAPI = (phone, otp) => api.post("/user/verify-otp", { phone, otp });


export const searchUsersAPI = (search, selectedRole, page=1,limit=10) => api.get(`/user/search`, {
  params: { name: search, role: selectedRole, page, limit },
});

export const updateUserRoleAPI = (id, role) => api.put(`/user/${id}`, { role });
// export const deleteUserAPI = (id) => api.delete(`/user/${id}`);


// Product Api Calls
export const getProductsAPI = (search, selectedCategory, selectedTags, currentPage, itemsPerPage) => api.get(`/product/`, {
  params: { product_name: search, category_id: selectedCategory, tags: selectedTags, page: currentPage, limit: itemsPerPage },
});
export const searchProductsAPI = (search, selectedCategory, selectedTags, currentPage, itemsPerPage) => api.get(`/product/search`, {
  params: { product_name: search, category_id: selectedCategory, tags: selectedTags, page: currentPage, limit: itemsPerPage },
});

// Cart Api Calls

export const getCartAPI = () => api.get("/cart");
export const addToCartAPI = ( product_id ) => api.post("/cart/add", {product_id});
export const removeFromCartAPI = (cart_item_id) => api.delete(`/cart/remove/${cart_item_id}`);
export const updateCartAPI = (cart_item_id, quantity) => api.put(`/cart/update`, {cart_item_id, quantity});

// Order Api Calls

export const placeOrderAPI = (data) => api.post("/order");
export const getOrdersAPI = () => api.get("/order");

export const getAllOrdersAPI = (status, page = 1, limit=10) => api.get(`/order/all?page=${page}&limit=${limit}&status=${status}`);
export const updateOrderStatusAPI = (id, status) =>
  api.put(`/order/${id}`, { status });

// Product Api Calls

export const createProductAPI = (data) => api.post("/product", data);
export const getProductAPI = (id) => api.get(`/product/${id}`);
export const updateProductAPI = (id, data) => api.put(`/product/${id}`, data);   // data => product_name, price, package_size
export const updateProductImageAPI = (data) => api.post(`/product/update-image`, data);  //  data => currentImageId , image as flle
export const updateProductImagesAPI = (data) => api.post(`/product/update-images/`, data);  // data => images as file array
export const getProductImagesTagsAPI = (id) => api.get(`/product/${id}/images`);
export const deleteProductAPI = (id) => api.delete(`/product/${id}`);


export const getCategoriesAPI = () => api.get("/category");
export const createCategoryAPI = (category) => api.post("/category", {name: category});
export const updateCategoryAPI = (category, id) => api.put(`/category/${id}`, {name: category});

export const getTagsAPI = () => api.get("/tag");
export const createTagAPI = (tag) => api.post("/tag", {name: tag});
export const updateTagAPI = (tag, id) => api.put(`/tag/${id}`, {name: tag});
