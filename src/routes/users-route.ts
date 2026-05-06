import { Elysia, t } from 'elysia';
import { UsersService } from '../services/users-service';

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .post(
    '/',
    async ({ body, set }) => {
      try {
        return await UsersService.registerUser(body);
      } catch (error: any) {
        set.status = 400;
        return { Error: error.message };
      }
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
    async ({ body, set }) => {
      try {
        return await UsersService.loginUser(body);
      } catch (error: any) {
        set.status = 401;
        return { Error: error.message };
      }
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
    async ({ headers, set }) => {
      try {
        const authHeader = headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new Error('Unauthorized!');
        }

        const token = authHeader.split(' ')[1];
        return await UsersService.getCurrentUser(token);
      } catch (error: any) {
        set.status = 401;
        return { Error: error.message };
      }
    }
  );
