import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserToken extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user' });
    }
  }
  UserToken.init(
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      expiresIn: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ip: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'UserToken',
    },
  );
  return UserToken;
};
