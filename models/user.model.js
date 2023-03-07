import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      this.hasMany(models.UserToken, { foreignKey: 'user' });
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
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'writer',
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        validate: {
          isIn: {
            args: [['pending', 'active', 'deleted']],
            msg: 'Incorect user status value',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
    },
  );
  return User;
};
