export default (sequelize, Sequelize) => {
    const { DataTypes } = Sequelize;
    const Tag = sequelize.define('Tag', {
      tag_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    }, {
      tableName: "Tag",
      timestamps: false,
    });
  
    return Tag;
  };