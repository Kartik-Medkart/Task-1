export default (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;
  const CartItem = sequelize.define(
    "CartItem",
    {
      cart_item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cart_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Cart",
          key: "cart_id",
        },
        onDelete: "CASCADE",
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Product",
          key: "product_id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
    },
    {
      tableName: "CartItem",
      timestamps: false,
    }
  );

  return CartItem;
};