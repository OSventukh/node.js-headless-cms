import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }

<<<<<<< HEAD
  User.init({
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'writer',
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
