import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Page extends Model {
    static associate(models) {
      this.belongsTo(models.Topic, { foreignKey: 'topicId'});
    }
  }
  Page.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'draft',
        validate: {
          isIn: {
            args: [['draft', 'published']],
            msg: 'Incorect post status value',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Page',
    },
  );
  return Page;
};
