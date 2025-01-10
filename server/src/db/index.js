import dotenv from 'dotenv'
dotenv.config({
    path: './.env'
});

import Sequelize from 'sequelize';
import User from '../models/user.model.js'
import Product from '../models/product.model.js'
import Order from '../models/order.model.js'
import Cart from '../models/cart.model.js';
import cartItem from '../models/cartItem.model.js';

console.log(process.env.POSTGRES_USERNAME)
const config = {
    username: process.env.POSTGRES_USERNAME,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
};

const sequelize = new Sequelize(config);

// Import models
const models = {
  Cart: Cart(sequelize, Sequelize),
  Product: Product(sequelize, Sequelize),
  CartItem: cartItem(sequelize, Sequelize),
  Order: Order(sequelize, Sequelize),
  User: User(sequelize, Sequelize),
};

// Establish relationships (Associations)

models.User.hasMany(models.Order);
models.Order.belongsTo(models.User);

models.Cart.hasMany(models.CartItem);
models.CartItem.belongsTo(models.Cart);

models.CartItem.belongsTo(models.Product);
models.Product.hasMany(models.CartItem);

export { sequelize, models };