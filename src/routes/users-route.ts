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
  );
