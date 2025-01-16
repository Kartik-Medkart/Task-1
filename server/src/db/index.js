import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import Sequelize from "sequelize";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import ProductImages from "../models/productImages.model.js";
import Tag from "../models/tag.model.js";
import ProductTags from "../models/productTags.model.js";

console.log(process.env.POSTGRES_USERNAME);
const config = {
  username: process.env.POSTGRES_USERNAME,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  dialect: "postgres",
};

const sequelize = new Sequelize(config);

// Import models
const models = {
  Cart: Cart(sequelize, Sequelize),
  Product: Product(sequelize, Sequelize),
  CartItem: CartItem(sequelize, Sequelize),
  Order: Order(sequelize, Sequelize),
  User: User(sequelize, Sequelize),
  ProductImages: ProductImages(sequelize, Sequelize),
  Tag: Tag(sequelize, Sequelize),
  ProductTags: ProductTags(sequelize, Sequelize),
};

// Establish relationships (Associations)

// User and Order
models.Order.belongsTo(models.User, {
  foreignKey: "user_id",
  as: "user",
  onDelete: "CASCADE",
});
models.User.hasMany(models.Order, { foreignKey: "user_id", as: "orders" });

// Order and Cart
models.Order.belongsTo(models.Cart, {
  foreignKey: "cart_id",
  as: "cart",
  onDelete: "CASCADE",
});
models.Cart.hasOne(models.Order, { foreignKey: "cart_id" });

// Cart and CartItem
models.CartItem.belongsTo(models.Cart, {
  foreignKey: "cart_id",
  onDelete: "CASCADE",
});
models.Cart.hasMany(models.CartItem, {
  foreignKey: "cart_id",
  as: "items",
});

// CartItem and Product
models.CartItem.belongsTo(models.Product, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
});
models.Product.hasMany(models.CartItem, { foreignKey: "product_id" });

// ProductImages and Product
models.ProductImages.belongsTo(models.Product, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
});
models.Product.hasMany(models.ProductImages, {
  foreignKey: "product_id",
  as: "images",
});

// Product and Tag (Many-to-Many)
models.Product.belongsToMany(models.Tag, {
  through: models.ProductTags,
  foreignKey: "product_id",
  otherKey: "tag_id",
  as: "productTags",
});
models.Tag.belongsToMany(models.Product, {
  through: models.ProductTags,
  foreignKey: "tag_id",
  otherKey: "product_id",
  as: "taggedProducts",
});

// CartItem and Order
models.CartItem.belongsTo(models.Order, {
  foreignKey: "order_id",
  onDelete: "CASCADE",
});
models.Order.hasMany(models.CartItem, {
  foreignKey: "order_id",
  as: "items",
});

export { sequelize, models };
