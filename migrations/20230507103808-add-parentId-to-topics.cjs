/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn('Topics', 'parentId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Topics',
        key: 'id',
      },
    });
  },

  async down(queryInterface) {
    queryInterface.removeColumn('Topics', 'parentId');
  },
};
