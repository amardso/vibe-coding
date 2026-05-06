import { Elysia, t } from 'elysia';
import { db } from './db';
import { users } from './db/schema';

const app = new Elysia()
  .get('/', () => 'Hello Elysia!')
  .group('/users', (app) =>
    app
      .get('/', async () => {
        try {
          return await db.select().from(users);
        } catch (error) {
          return { error: 'Database connection failed. Please check your .env file.' };
        }
      })
      .post(
        '/',
        async ({ body }) => {
          try {
            await db.insert(users).values(body);
            return { success: true };
          } catch (error) {
            return { error: 'Database insertion failed.' };
          }
        },
        {
          body: t.Object({
            name: t.String(),
            email: t.String(),
          }),
        }
      )
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
