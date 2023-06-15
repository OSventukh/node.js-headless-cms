/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const TOPIC_CONTENT = await import('../utils/constants/content.js');

    await queryInterface.addColumn('Topics', 'content', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: TOPIC_CONTENT.POSTS,
      validate: {
        args: [[TOPIC_CONTENT.PAGE, TOPIC_CONTENT.POSTS]],
        msg: 'Incorect topic content value',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Topics', 'content');
  },
};
