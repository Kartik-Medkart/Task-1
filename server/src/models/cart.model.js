export default (sequelize, Sequelize) => {
    const Cart = sequelize.define('Cart', {
      cart_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cart_items: {
        type: Sequelize.ARRAY({
          type: Sequelize.INTEGER,
          references: {
            model: 'CartItem',
            key: 'cart_item_id',
          },
        }),
        defaultValue: [],
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
    },
    {
      tableName: "Cart",
      timestamps: false, 
    });
    return Cart;
  };
  