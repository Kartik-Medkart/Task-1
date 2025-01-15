export default (sequelize, Sequelize) => {
    const { DataTypes } = Sequelize;
    const ProductTags = sequelize.define('ProductTags', {
      product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'Product',
          key: 'product_id',
        },
        onDelete: 'CASCADE',
      },
      tag_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'Tag',
          key: 'tag_id',
        },
        onDelete: 'CASCADE',
      },
    }, {
      tableName: "ProductTags",
      timestamps: false,
    });
  
    return ProductTags;
  };