import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Page extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Page.init(
    {
      title: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
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
            args: [['draft', 'publish']],
            msg: 'Incorect value',
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
