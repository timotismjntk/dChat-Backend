'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('user', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('User', 'deviceToken', {
      type: Sequelize.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('user');
     */
    await queryInterface.removeColumn('User', 'deviceToken')
  }
};
