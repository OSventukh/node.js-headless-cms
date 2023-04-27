import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Post, { foreignKey: 'postId', as: 'posts', through: 'PostCategory' });
      this.belongsTo(models.Category, { foreignKey: 'parentId', as: 'parent' });
      this.hasMany(models.Category, { foreignKey: 'parentId', as: 'children' });
    }
  }

  Category.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Category',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Category',
    },
  );

  return Category;
};
