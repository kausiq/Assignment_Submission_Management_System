const request = require('supertest');
const app = require('../app');
const { seedBaseFixtures } = require('./helpers');

const futureDate = () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

describe('Assignment creation & ownership rules', () => {
  test('a teacher assigned to the subject can create a published assignment', async () => {
    const { tokens, cls, subject } = await seedBaseFixtures();
    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({
        title: 'HW1',
        description: 'Do the exercises',
        classId: cls._id.toString(),
        subjectId: subject._id.toString(),
        deadline: futureDate(),
        maxMarks: 100,
        status: 'published'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('published');
  });

  test('a teacher NOT assigned to the subject cannot create an assignment for it', async () => {
    const { tokens, cls, subject } = await seedBaseFixtures();
    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${tokens.otherTeacher}`)
      .send({
        title: 'HW1',
        description: 'Do the exercises',
        classId: cls._id.toString(),
        subjectId: subject._id.toString(),
        deadline: futureDate(),
        maxMarks: 100
      });

    expect(res.status).toBe(403);
  });

  test('students cannot create assignments', async () => {
    const { tokens, cls, subject } = await seedBaseFixtures();
    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({
        title: 'HW1',
        description: 'Do the exercises',
        classId: cls._id.toString(),
        subjectId: subject._id.toString(),
        deadline: futureDate(),
        maxMarks: 100
      });

    expect(res.status).toBe(403);
  });

  test('draft assignments are not visible to students', async () => {
    const { tokens, cls, subject } = await seedBaseFixtures();
    await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({
        title: 'Draft HW',
        description: 'Not yet published',
        classId: cls._id.toString(),
        subjectId: subject._id.toString(),
        deadline: futureDate(),
        maxMarks: 100,
        status: 'draft'
      });

    const res = await request(app).get('/api/assignments').set('Authorization', `Bearer ${tokens.student}`);
    expect(res.status).toBe(200);
    expect(res.body.data.find((a) => a.title === 'Draft HW')).toBeUndefined();
  });

  test('published assignments for the student\'s class ARE visible to the student', async () => {
    const { tokens, cls, subject } = await seedBaseFixtures();
    await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({
        title: 'Published HW',
        description: 'Visible',
        classId: cls._id.toString(),
        subjectId: subject._id.toString(),
        deadline: futureDate(),
        maxMarks: 100,
        status: 'published'
      });

    const res = await request(app).get('/api/assignments').set('Authorization', `Bearer ${tokens.student}`);
    expect(res.status).toBe(200);
    expect(res.body.data.some((a) => a.title === 'Published HW')).toBe(true);
  });

  test('a teacher cannot update another teacher\'s assignment', async () => {
    const { tokens, cls, subject } = await seedBaseFixtures();
    const createRes = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({
        title: 'Owned by teacher',
        description: 'desc',
        classId: cls._id.toString(),
        subjectId: subject._id.toString(),
        deadline: futureDate(),
        maxMarks: 100,
        status: 'published'
      });

    const assignmentId = createRes.body.data._id;
    const res = await request(app)
      .put(`/api/assignments/${assignmentId}`)
      .set('Authorization', `Bearer ${tokens.otherTeacher}`)
      .send({ title: 'Hijacked title' });

    expect(res.status).toBe(403);
  });
});
