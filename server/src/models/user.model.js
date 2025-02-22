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
        type: Sequelize.ENUM('admin', 'customer', 'superadmin'),
        defaultValue: 'customer',
      },
      address: Sequelize.STRING,
      city : Sequelize.STRING,
      state : Sequelize.STRING,
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cart_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Cart',
          key: 'cart_id',
        },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: "User",
      timestamps: false, 
    });
    return User;
  };