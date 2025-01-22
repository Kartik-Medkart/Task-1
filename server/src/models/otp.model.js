

export default (sequelize, Sequelize) => {
  const OTP = sequelize.define(
    "OTP",
    {
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isNumeric: true,
          len: {
            args: [10, 10],
            msg: "Phone number must be exactly 10 digits long",
          },
        },
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "OTP",
      timestamps: false,
    }
  );
  return OTP;
};
