import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      this.hasMany(models.UserToken, { foreignKey: 'userId', as: 'tokens' });
      this.hasMany(models.Post, { foreignKey: 'userId', as: 'posts' });
      this.hasMany(models.Page, { foreignKey: 'userId', as: 'pages' });
      this.belongsToMany(models.Topic, { foreignKey: 'topicId', as: 'topics', through: 'TopicUsers' });
      this.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
    }
  }

  User.init(
    {
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        validate: {
          notEmpty: true,
        },
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
        validate: {
          isIn: {
            args: [['blocked', 'active']],
            msg: 'Incorect user status value',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      paranoid: true,
    },
  );
  return User;
};
