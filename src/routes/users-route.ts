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
  .onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      set.status = 400;
      return { Error: error.message };
    }
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
        Name: t.String({ maxLength: 255, default: 'John Doe' }),
        Email: t.String({ maxLength: 255, default: 'john@example.com' }),
        Password: t.String({ maxLength: 255, default: 'password123' }),
      }),
      response: {
        200: t.Object({
          Data: t.String({ default: 'OK' }),
        }),
        400: t.Object({
          Error: t.String(),
        }),
      },
      detail: {
        summary: 'Registrasi Pengguna Baru',
        description: 'Mendaftarkan pengguna baru dengan Name, Email, dan Password.',
        tags: ['Users'],
      },
    }
  )
  .post(
    '/login',
    async ({ body }) => {
      return await UsersService.loginUser(body);
    },
    {
      body: t.Object({
        Email: t.String({ default: 'john@example.com' }),
        Password: t.String({ default: 'password123' }),
      }),
      response: {
        200: t.Object({
          Data: t.String({ default: 'uuid-token-session' }),
        }),
        401: t.Object({
          Error: t.String({ default: 'Email atau Password salah!' }),
        }),
      },
      detail: {
        summary: 'Login Pengguna',
        description: 'Melakukan login dan mendapatkan token autentikasi.',
        tags: ['Users'],
      },
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
        authorization: t.String({ default: 'Bearer <token>' }),
      }),
      response: {
        200: t.Object({
          Data: t.Object({
            id: t.Number({ default: 1 }),
            Name: t.String({ default: 'John Doe' }),
            Email: t.String({ default: 'john@example.com' }),
            Created_at: t.String({ default: '2026-05-07T00:00:00Z' }),
          }),
        }),
        401: t.Object({
          Error: t.String({ default: 'Unauthorized!' }),
        }),
      },
      detail: {
        summary: 'Ambil Profil Pengguna',
        description: 'Mendapatkan data profil pengguna yang sedang login.',
        tags: ['Users'],
      },
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
        authorization: t.String({ default: 'Bearer <token>' }),
      }),
      response: {
        200: t.Object({
          Data: t.String({ default: 'OK' }),
        }),
        401: t.Object({
          Error: t.String({ default: 'Unauthorized!' }),
        }),
      },
      detail: {
        summary: 'Logout Pengguna',
        description: 'Menghapus sesi login pengguna saat ini.',
        tags: ['Users'],
      },
    }
  );
