export default (sequelize, Sequelize) => {
    const Order = sequelize.define('Order', {
      order_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'User',
          key: 'user_id',
        },
        onDelete: 'CASCADE',
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
        allowNull: false,
        defaultValue: 'pending',
      },
      total_amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      delivery_address: Sequelize.STRING,
      shipping_date: {
        type : Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      delivered_date: {
        type: Sequelize.DATE,
        defaultValue: () => {
          const date = new Date();
          date.setDate(date.getDate() + 5); // Add 5 days to the current date
          return date;
        },
      },
    },
    {
      tableName: "Order",
      timestamps: false, 
    });

    return Order;
  };
  