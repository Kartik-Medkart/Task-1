# Project Documentation

This document provides an overview of the project's structure, including **frontend routes** and **backend API endpoints**.

---

## Frontend Pages

1. Public Pages
   - `/login` - Login Page
   - `/signup` - Registration Page
   - `/products` - Product Listing Page
       - Display Products with Filters - Search By Name & WS_Code, Categories, Tags & Sort 
     
1. **Customer Pages**:
   - `/profile` - User Profile
       - Display User Information, User's Orders, Logout
   - `/cart` - Cart Page
      - Display Cart Items, Update Cart Items & Place Order

2. **Admin Page**: `/admin`
   -  Admin Profile Information
   -  Manage Products ( ADD, UPDATE, DELETE )
   -  Manage Orders ( UPDATE STATUS )
   -  Manage Tags ( ADD, UPDATE )
   -  Manage Users ( VIEW USER ORDER COUNT, EDIT ROLE )

---

## Backend API Endpoints

Below are the API endpoints categorized by their functionality.

### Customer APIs

#### User Management
- **POST** `/api/v1/user` - Create a new user
- **POST** `/api/v1/user/update` - Update user information
- **POST** `/api/v1/user/reset-password` - Reset user password (Not Using)
- **POST** `/api/v1/user/login` - User login
- **POST** `/api/v1/user/logout` - User logout

#### Product Management (Public)
- **GET** `/api/v1/product` - Get all products (pagination supported)
- **GET** `/api/v1/product/:WsCode` - Get product by `WsCode`
- **GET** `/api/v1/product/search` - Search products by name, category, or tags

#### Cart Management
- **POST** `/api/v1/cart/add` - Add product to cart
- **GET** `/api/v1/cart` - View items in cart
- **DELETE** `/api/v1/cart/remove` - Remove item from cart
- **POST** `/api/v1/cart/update` - Update quantity of a cart item

#### Order Management
- **POST** `/api/v1/order` - Create a new order
- **GET** `/api/v1/order` - Get orders for the current user

---

### Admin APIs

#### Order Management
- **GET** `/api/v1/order/all` - Get all orders (pagination supported)
- **PUT** `/api/v1/order/:order_id` - Update order status by `order_id`

#### Product Management
- **POST** `/api/v1/product` - Create a new product
- **POST** `/api/v1/product/update-image` - Update a single image for a product
- **POST** `/api/v1/product/update-images` - Update multiple images for a product
- **DELETE** `/api/v1/product/:WsCode` - Delete product by `WsCode`

#### Tag Management
- **POST** `/api/v1/tag` - Create a new tag
- **GET** `/api/v1/tag` - Get all tags
- **PUT** `/api/v1/tag/:tag_id` - Update a tag by ID

---
