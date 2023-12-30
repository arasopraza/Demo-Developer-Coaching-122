const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
    config: {
      auth: 'auth_app',
      plugins: {
        hacli: {
          permissions: ['CAN_CREATE_RESOURCE']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: handler.getUserByIdHandler,
    config: {
      auth: 'auth_app',
      plugins: {
        hacli: {
          permissions: ['USER']
        }
      }
    }
  },
];

module.exports = routes;
