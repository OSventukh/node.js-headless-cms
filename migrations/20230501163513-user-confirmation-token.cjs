/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.changeColumn('Users', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['blocked', 'active', 'pending']],
          msg: 'Incorect user status value',
        },
      },
    });
    queryInterface.addColumn('Users', 'confirmationToken', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    queryInterface.addColumn('Users', 'confirmationTokenExpirationDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.changeColumn('Users', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [['blocked', 'active']],
          msg: 'Incorect user status value',
        },
      },
    });
    queryInterface.removeColumn('Users', 'confirmationToken');
    queryInterface.removeColumn('Users', 'confirmationTokenExpirationDate');
  },
};
