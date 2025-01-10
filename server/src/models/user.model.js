export default (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      firstName: Sequelize.STRING,
      lastName: Sequelize.STRING,
      role: {
        type: Sequelize.ENUM('admin', 'customer'),
        defaultValue: 'customer',
      },
      cart_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Cart',
          key: 'cart_id',
        },
      },
      orders: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
      },
    },
    {
      tableName: "User",
      timestamps: false, 
    });
    return User;
  };