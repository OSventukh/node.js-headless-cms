import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserToken extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  UserToken.init(
    {
      token: {
        type: DataTypes.STRING(512),
        allowNull: false,
        unique: true,
      },
      expiresIn: {
        type: DataTypes.DATE,
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
