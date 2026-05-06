import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export class UsersService {
  static async registerUser(data: { Name: string; Email: string; Password: string }) {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.Email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('Email sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(data.Password, 10);

    await db.insert(users).values({
      name: data.Name,
      email: data.Email,
      password: hashedPassword,
    });

    return { Data: 'OK' };
  }

  static async loginUser(data: { Email: string; Password: string }) {
    // 1. Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, data.Email))
      .limit(1);

    if (user.length === 0) {
      throw new Error('Email atau Password salah!');
    }

    // 2. Verify password
    const isPasswordCorrect = await bcrypt.compare(data.Password, user[0].password);

    if (!isPasswordCorrect) {
      throw new Error('Email atau Password salah!');
    }

    // 3. Generate token
    const token = crypto.randomUUID();

    // 4. Create session
    await db.insert(sessions).values({
      token,
      name: 'Web Login',
      userId: user[0].id,
    });

    return { Data: token };
  }

  static async getCurrentUser(token: string) {
    // 1. Find session by token
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (session.length === 0) {
      throw new Error('Unauthorized!');
    }

    // 2. Find user by id from session
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session[0].userId))
      .limit(1);

    if (user.length === 0) {
      throw new Error('Unauthorized!');
    }

    // 3. Return user data (excluding password)
    return {
      Data: {
        id: user[0].id,
        Name: user[0].name,
        Email: user[0].email,
        Created_at: user[0].createdAt,
      },
    };
  }
}
