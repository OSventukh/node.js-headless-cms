import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      // define association here
    }
  }

  Post.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
    },
    {
      sequelize,
      modelName: 'Topic',
    }
  );
  return Post;
};
