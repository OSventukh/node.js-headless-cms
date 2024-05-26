import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserBlockedToken extends Model {
    static associate(models) {
      this.belongsTo(models.User);
    }
  }
  UserBlockedToken.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      token: {
        type: DataTypes.STRING(512),
        allowNull: false,
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
