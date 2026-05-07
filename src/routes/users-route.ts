import { Elysia, t } from 'elysia';
import { UsersService } from '../services/users-service';
import { ResponseError } from '../exceptions/response-error';

const extractToken = (headers: Record<string, string | undefined>) => {
  const authHeader = headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ResponseError(401, 'Unauthorized!');
  }
  return authHeader.split(' ')[1];
};

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .onError(({ error, set }) => {
    if (error instanceof ResponseError) {
      set.status = error.status;
      return { Error: error.message };
    }
    set.status = 500;
    return { Error: error.message };
  })
  .post(
    '/',
    async ({ body }) => {
      return await UsersService.registerUser(body);
    },
    {
      body: t.Object({
        Name: t.String(),
        Email: t.String(),
        Password: t.String(),
      }),
    }
  )
  .post(
    '/login',
    async ({ body }) => {
      return await UsersService.loginUser(body);
    },
    {
      body: t.Object({
        Email: t.String(),
        Password: t.String(),
      }),
    }
  )
  .get(
    '/current',
    async ({ headers }) => {
      const token = extractToken(headers);
      return await UsersService.getCurrentUser(token);
    },
    {
      headers: t.Object({
        authorization: t.String(),
      }),
    }
  )
  .delete(
    '/logout',
    async ({ headers }) => {
      const token = extractToken(headers);
      return await UsersService.logout(token);
    },
    {
      headers: t.Object({
        authorization: t.String(),
      }),
    }
  );
