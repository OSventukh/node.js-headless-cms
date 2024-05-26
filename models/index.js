/* eslint-disable no-underscore-dangle */
import { Sequelize, DataTypes } from 'sequelize';
import database from '../config/database.js';
import PageModel from './page.model.js';
import PostModel from './post.model.js';
import TopicModel from './topic.model.js';
import UserModel from './user.model.js';
import CategoryModel from './category.js';
import OptionModel from './option.model.js';
import UserTokenModel from './user-token.model.js';
import UserBlockedTokenModel from './user-blocked-token.model.js';
import RoleModel from './role.js';

const env = process.env.NODE_ENV || 'development';

const sequelize = new Sequelize({...database[env], define: { charset: 'utf8', collate: 'utf8_unicode_ci' }});

const models = {
  Page: PageModel(sequelize, DataTypes),
  Topic: TopicModel(sequelize, DataTypes),
  User: UserModel(sequelize, DataTypes),
  Post: PostModel(sequelize, DataTypes),
  Category: CategoryModel(sequelize, DataTypes),
  Option: OptionModel(sequelize, DataTypes),
  UserToken: UserTokenModel(sequelize, DataTypes),
  UserBlockedToken: UserBlockedTokenModel(sequelize, DataTypes),
  Role: RoleModel(sequelize, DataTypes),
};

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export const { Page } = models;
export const { Topic } = models;
export const { User } = models;
export const { Post } = models;
export const { Category } = models;
export const { Option } = models;
export const { UserToken } = models;
export const { UserBlockedToken } = models;
export const { Role } = models;

export {
  sequelize,
  Sequelize,
};
