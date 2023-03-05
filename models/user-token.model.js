import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserToken extends Model {
    static associate(models) {
      this.belongsTo(models.User);
    }
  }
  UserToken.init(
    {
      user: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
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
