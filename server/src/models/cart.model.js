export default (sequelize, Sequelize) => {
    const Cart = sequelize.define('Cart', {
      cart_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'user_id',
        },
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0.00,
        get() {
          const value = this.getDataValue('amount');
          return parseFloat(value); // Convert the string to a number
        },
      },
    },
    {
      tableName: "Cart",
      timestamps: false, 
    });

    return Cart;
  };
  