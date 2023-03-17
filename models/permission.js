import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      this.belongsToMany(models.Role, { foreignKey: 'roleId', through: 'RolePermission' });
    }
  }

  Permission.init(
    {
      modelName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      permission: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: 'Permission',
    },
  );
  return Permission;
};
