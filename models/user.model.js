import { Model } from 'sequelize';
import ms from 'ms';
import generateConfirmationToken from '../utils/confirmation-token.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { ACTIVE, PENDING, BLOCKED } from '../utils/constants/users.js';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      this.hasMany(models.UserToken, { foreignKey: 'userId', as: 'tokens' });
      this.hasMany(models.Post, { foreignKey: 'userId', as: 'posts' });
      this.belongsToMany(models.Topic, {
        foreignKey: 'userId',
        as: 'topics',
        through: 'TopicUsers',
      });
      this.belongsTo(models.Role, { foreignKey: 'userId', as: 'role' });
    }

    getPublicData() {
      return {
        id: this.id,
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email,
        createdAt: this.createdAt,
        ...(this.role?.name && { role: this.role?.name }),
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
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
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
        allowNull: true,
      },
      confirmationToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      confirmationTokenExpirationDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: PENDING,
        validate: {
          isIn: {
            args: [[ACTIVE, PENDING, BLOCKED]],
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
          record.confirmationToken = await generateConfirmationToken(User);
          record.confirmationTokenExpirationDate = new Date(Date.now() + ms('1 day'));
          if (record.password) {
            record.password = await hashPassword(record.password);
          }
        },
        beforeBulkUpdate: async (record) => {
          if (record.password) {
            record.attributes.password = await hashPassword(
              record.attributes.password
            );
          }
        },
        beforeUpdate: async (record) => {
          if (record.password) {
            record.password = await hashPassword(record.password);
          }
        },
      },
    }
  );
  return User;
};
