import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // define association here
      this.belongsToMany(models.Post, {
        foreignKey: 'categoryId',
        as: 'posts',
        through: 'PostCategory',
      });
      this.belongsTo(models.Category, { foreignKey: 'parentId', as: 'parent' });
      this.hasMany(models.Category, { foreignKey: 'parentId', as: 'children' });
      this.belongsToMany(models.Topic, {
        foreignKey: 'categoryId',
        as: 'topics',
        through: 'TopicCategory',
      });
    }
  }

  Category.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
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
    },
    {
      sequelize,
      modelName: 'Category',
    }
  );

  return Category;
};
