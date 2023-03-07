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

const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(database[env]);

const Page = PageModel(sequelize, DataTypes);
const Topic = TopicModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Post = PostModel(sequelize, DataTypes);
const Category = CategoryModel(sequelize, DataTypes);
const Option = OptionModel(sequelize, DataTypes);
const UserToken = UserTokenModel(sequelize, DataTypes);
const UserBlockedToken = UserBlockedTokenModel(sequelize, DataTypes);

export {
  sequelize,
  Sequelize,
  Page,
  Topic,
  User,
  Post,
  Category,
  Option,
  UserToken,
  UserBlockedToken,
};
