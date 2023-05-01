import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      // define association here
      this.belongsToMany(models.User, { foreignKey: 'userId', as: 'users', through: 'TopicUsers' });
      this.belongsToMany(models.Post, { foreignKey: 'postId', as: 'posts', through: 'PostTopic' });
      this.hasMany(models.Page, { foreignKey: 'pageId', as: 'pages' });
      this.hasMany(models.Category, { foreignKey: 'topicId', as: 'categories' });
    }
  }

  Post.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
        validate: {
          isIn: {
            args: [['active', 'inactive']],
            msg: 'Incorect topic status value',
          },
        },
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Topic',
    },
  );
  return Post;
};
