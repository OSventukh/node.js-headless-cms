import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserBlockedToken extends Model {
    static associate(models) {
      this.belongsTo(models.User);
    }
  }
  UserBlockedToken.init(
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
    },
    {
      sequelize,
      modelName: 'UserBlockedToken',
    },
  );
  return UserBlockedToken;
};
