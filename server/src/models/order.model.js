export default (sequelize, Sequelize) => {
    const Order = sequelize.define('Order', {
      order_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cart_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Cart',
          key: 'cart_id',
        },
      },
      order_status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
      },
      total_amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      delivery_address: Sequelize.STRING,
      shipping_date: Sequelize.DATE,
      delivered_date: Sequelize.DATE,
    },
    {
      tableName: "Order",
      timestamps: false, 
    });
    return Order;
  };
  