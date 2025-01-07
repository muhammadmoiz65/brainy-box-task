module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('Roles', [
      { name: 'Admin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Editor', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Viewer', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Roles', null, {});
  },
};

// seeders/20250104-create-permissions.js
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('PermissionSets', [
      { role_id: 1, resource: '/tasks', permissions: JSON.stringify(['GET', 'POST', 'PUT', 'DELETE']), createdAt: new Date(), updatedAt: new Date() },
      { role_id: 2, resource: '/tasks', permissions: JSON.stringify(['GET', 'POST', 'PUT']), createdAt: new Date(), updatedAt: new Date() },
      { role_id: 3, resource: '/tasks', permissions: JSON.stringify(['GET']), createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('PermissionSets', null, {});
  },
};
