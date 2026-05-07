import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { usersRoute } from './routes/users-route';

export const app = new Elysia()
  .use(
    swagger({
      path: '/swagger',
      documentation: {
        info: {
          title: 'Vibe Coding API Documentation',
          version: '1.0.0',
          description: 'Dokumentasi API untuk project Vibe Coding',
        },
      },
    })
  )
  .get('/', () => 'Hello Elysia!')
  .use(usersRoute);
