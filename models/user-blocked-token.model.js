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
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'UserBlockedToken',
    },
  );
  return UserBlockedToken;
};
