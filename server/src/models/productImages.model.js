export default (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;
  const ProductImages = sequelize.define(
    "ProductImages",
    {
      image_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Product",
          key: "product_id",
        },
        onDelete: "CASCADE",
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "ProductImages",
      timestamps: false,
    }
  );

  return ProductImages;
};
