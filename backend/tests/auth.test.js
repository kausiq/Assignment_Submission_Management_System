const request = require('supertest');
const app = require('../app');
const { seedBaseFixtures } = require('./helpers');

describe('Auth', () => {
  test('logs in successfully with correct credentials and returns a JWT', async () => {
    await seedBaseFixtures();
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'Password1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@test.com');
    expect(res.body.data.user.password).toBeUndefined();
  });

  test('rejects login with wrong password', async () => {
    await seedBaseFixtures();
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'WrongPass1' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('rejects login for a non-existent user', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@test.com', password: 'Password1' });
    expect(res.status).toBe(401);
  });

  test('rejects access to protected routes without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('rejects access with a malformed/invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  test('returns the authenticated user profile with a valid token', async () => {
    const { tokens, student } = await seedBaseFixtures();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${tokens.student}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(student.email);
  });
});

describe('Role-based authorization', () => {
  test('students cannot create users (admin-only route)', async () => {
    const { tokens } = await seedBaseFixtures();
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ name: 'X', email: 'x@test.com', password: 'Password1', role: 'student' });
    expect(res.status).toBe(403);
  });

  test('teachers cannot create classes (admin-only route)', async () => {
    const { tokens } = await seedBaseFixtures();
    const res = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({ name: 'New Class' });
    expect(res.status).toBe(403);
  });

  test('admin can create a class', async () => {
    const { tokens } = await seedBaseFixtures();
    const res = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ name: 'New Class', section: 'C' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New Class');
  });
});
