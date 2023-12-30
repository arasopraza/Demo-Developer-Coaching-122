// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// users
const users = require('./api/users');
const UsersService = require('./services/UsersService');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');

const init = async () => {
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    debug: {
      request: ['error']
    },
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: require('@antoniogiordano/hacli'),
      options: {
        permissions: {
          SUPERADMIN: {
            ADMIN: {
              CAN_CREATE_RESOURCE: {},
              CAN_EDIT_RESOURCE: {},
              CAN_DELETE_RESOURCE: {},
              USER: {
                CAN_READ_RESOURCE: {},
              }
            }
          }
        }
      }
    }
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('auth_app', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
        permissions: artifacts.decoded.payload.role,
      },
    }),
  });


  await server.register([
    {
      plugin: users,
      options: {
        service: usersService,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
