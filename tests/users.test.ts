import { describe, expect, it, beforeEach } from 'bun:test';
import { app } from '../src/app';
import { db } from '../src/db';
import { users, sessions } from '../src/db/schema';

describe('Users API', () => {
  beforeEach(async () => {
    // Clean up database
    await db.delete(sessions);
    await db.delete(users);
  });

  describe('POST /api/users/', () => {
    it('should register a new user successfully', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Name: 'Test User',
            Email: 'test@example.com',
            Password: 'password123',
          }),
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ Data: 'OK' });
    });

    it('should return 400 if email already exists', async () => {
      // Pre-register user
      await app.handle(
        new Request('http://localhost/api/users/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Name: 'Test User',
            Email: 'test@example.com',
            Password: 'password123',
          }),
        })
      );

      const response = await app.handle(
        new Request('http://localhost/api/users/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Name: 'Another User',
            Email: 'test@example.com',
            Password: 'password456',
          }),
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.Error).toBe('Email sudah terdaftar');
    });

    it('should return 400 if name is too long', async () => {
      const longName = 'a'.repeat(300);
      const response = await app.handle(
        new Request('http://localhost/api/users/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Name: longName,
            Email: 'test@example.com',
            Password: 'password123',
          }),
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.Error).toContain('Expected string length less or equal to 255');
    });

    it('should return 400 if fields are missing', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Name: 'Test User',
          }),
        })
      );

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/users/login', () => {
    it('should login successfully and return a token', async () => {
      // Register first
      await app.handle(
        new Request('http://localhost/api/users/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Name: 'Test User',
            Email: 'test@example.com',
            Password: 'password123',
          }),
        })
      );

      const response = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Email: 'test@example.com',
            Password: 'password123',
          }),
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.Data).toBeDefined();
      expect(typeof data.Data).toBe('string');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Email: 'wrong@example.com',
            Password: 'wrongpassword',
          }),
        })
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.Error).toBe('Email atau Password salah!');
    });
  });

  describe('GET /api/users/current', () => {
    it('should return current user data for valid token', async () => {
      // Register and Login
      await app.handle(
        new Request('http://localhost/api/users/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Name: 'Test User',
            Email: 'test@example.com',
            Password: 'password123',
          }),
        })
      );

      const loginResponse = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Email: 'test@example.com',
            Password: 'password123',
          }),
        })
      );
      const { Data: token } = await loginResponse.json();

      const response = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.Data.Name).toBe('Test User');
      expect(data.Data.Email).toBe('test@example.com');
      expect(data.Data.password).toBeUndefined();
    });

    it('should return 400 if authorization header is missing', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
        })
      );

      expect(response.status).toBe(400);
    });

    it('should return 401 if token is invalid', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
          headers: { Authorization: 'Bearer invalid-token' },
        })
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.Error).toBe('Unauthorized!');
    });
  });

  describe('DELETE /api/users/logout', () => {
    it('should logout successfully', async () => {
      // Register and Login
      await app.handle(
        new Request('http://localhost/api/users/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Name: 'Test User',
            Email: 'test@example.com',
            Password: 'password123',
          }),
        })
      );

      const loginResponse = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Email: 'test@example.com',
            Password: 'password123',
          }),
        })
      );
      const { Data: token } = await loginResponse.json();

      const response = await app.handle(
        new Request('http://localhost/api/users/logout', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ Data: 'OK' });

      // Verify token is gone
      const verifyResponse = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      expect(verifyResponse.status).toBe(401);
    });
  });
});
