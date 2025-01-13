export default (sequelize, Sequelize) => {
  const Product = sequelize.define('Product', {
    product_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        is: /^[a-zA-Z\s]*$/ 
      }
    },
    ws_code: {
      type: Sequelize.INTEGER,
      unique: true,
      allowNull: false,
      validate: {
        min: 0 
      }
    },
    price: {
      type: Sequelize.DECIMAL,
      allowNull: false,
      validate: {
        min: 0.01 
      }
    },
    package_size: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 1 
      }
    },
    images: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      validate: {
        isValidImageArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Images must be an array');
          }
          value.forEach(image => {
            if (!/\.(jpg|png|jpeg|webp)$/i.test(image)) {
              throw new Error('Each image must be a .png, .jpeg, or .webp file');
            }
          });
        }
      }
    },
    tags: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      // validate: {
      //   is: /^[a-zA-Z\s]*$/ 
      // }
    }
  },
  {
    tableName: "Product",
    timestamps: false, 
  });
  return Product;
};