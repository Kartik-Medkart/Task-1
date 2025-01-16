export default (sequelize, Sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      product_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: /^[a-zA-Z0-9\s]*$/,
        },
      },
      ws_code: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      price: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      package_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Category",
          key: "category_id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "Product",
      timestamps: false,
    }
  );

  return Product;
};
