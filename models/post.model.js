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
    }
  }
  Post.init(
    {
      title: {
        allowNull: false,
        type: DataTypes.TEXT,
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
            args: [['draft', 'publish']],
            msg: 'Incorect value',
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
