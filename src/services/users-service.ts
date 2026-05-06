import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export class UsersService {
  static async registerUser(data: { Name: string; Email: string; Password: string }) {
    // 1. Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.Email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('Email sudah terdaftar');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(data.Password, 10);

    // 3. Insert user
    await db.insert(users).values({
      name: data.Name,
      email: data.Email,
      password: hashedPassword,
    });

    return { Data: 'OK' };
  }
}
