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
        Name: t.String({ maxLength: 255 }),
        Email: t.String({ maxLength: 255 }),
        Password: t.String({ maxLength: 255 }),
      }),
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
        Email: t.String(),
        Password: t.String(),
      }),
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
        authorization: t.String(),
      }),
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
        authorization: t.String(),
      }),
      detail: {
        summary: 'Logout Pengguna',
        description: 'Menghapus sesi login pengguna saat ini.',
        tags: ['Users'],
      },
    }
  );
