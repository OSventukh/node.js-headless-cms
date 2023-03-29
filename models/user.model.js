import { Model } from 'sequelize';
import { hashPassword, comparePassword } from '../utils/hash.js';

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

    getPublicData() {
      return {
        id: this.id,
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email,
        createdAt: this.createdAt,
        role: this?.role?.name,
      };
    }

    getTokenData() {
      return {
        id: this.id,
        email: this.email,
        role: this?.role?.name,
      };
    }

    async comparePassword(password) {
      return comparePassword(password, this.password);
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
      hooks: {
        beforeCreate: async (record) => {
          record.password = await hashPassword(record.password);
        },
        beforeBulkUpdate: async (record) => {
          if (record.password) {
            record.attributes.password = await hashPassword(record.attributes.password);
          }
        },
      },
    },
  );
  return User;
};
