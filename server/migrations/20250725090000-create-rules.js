"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  /**
   * Add altering commands here.
   *
   * Example:
   * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
   */
  await queryInterface.createTable("rules", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    kaynak_guvenlikbolgesi: Sequelize.JSONB,
    hedef_guvenlikbolgesi: Sequelize.JSONB,
    kaynak_adresi: Sequelize.JSONB,
    hedef_adresi: Sequelize.JSONB,
    servisler: Sequelize.STRING,
    time: Sequelize.DATE,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });
}
export async function down(queryInterface, Sequelize) {
  /**
   * Add reverting commands here.
   *
   * Example:
   * await queryInterface.dropTable('users');
   */
  await queryInterface.dropTable("rules");
}
