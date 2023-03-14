import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
      this.belongsToMany(models.Category, { foreignKey: 'categoryId', as: 'categories', through: 'PostCategory' });
      this.belongsToMany(models.Topic, { foreignKey: 'topicId', as: 'topics', through: 'PostTopic' });
    }
  }
  Post.init(
    {
      title: {
        allowNull: false,
        type: DataTypes.TEXT,
        validate: {
          notEmpty: true,
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      excerpt: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'draft',
        validate: {
          isIn: {
            args: [['draft', 'published']],
            msg: 'Incorect post status value',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Post',
    },
  );
  return Post;
};
