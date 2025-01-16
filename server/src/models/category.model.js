export default (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;
  const Category = sequelize.define(
    "Category",
    {
      category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "Category",
      timestamps: false,
    }
  );

  return Category;
};
