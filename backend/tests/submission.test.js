const request = require('supertest');
const app = require('../app');
const Assignment = require('../models/Assignment');
const { seedBaseFixtures } = require('./helpers');

const futureDate = () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
const pastDate = () => new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

const createPublishedAssignment = async (overrides = {}) => {
  return Assignment.create({
    title: 'HW1',
    description: 'desc',
    ...overrides
  });
};

describe('Submission workflow', () => {
  test('student can submit before the deadline', async () => {
    const { tokens, cls, subject, teacher } = await seedBaseFixtures();
    const assignment = await createPublishedAssignment({
      classId: cls._id,
      subjectId: subject._id,
      teacherId: teacher._id,
      deadline: futureDate(),
      maxMarks: 100,
      status: 'published'
    });

    const res = await request(app)
      .post(`/api/assignments/${assignment._id}/submissions`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'My answer' });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('submitted');
  });

  test('student cannot submit after the deadline when late submissions are disallowed', async () => {
    const { tokens, cls, subject, teacher } = await seedBaseFixtures();
    const assignment = await createPublishedAssignment({
      classId: cls._id,
      subjectId: subject._id,
      teacherId: teacher._id,
      deadline: pastDate(),
      maxMarks: 100,
      status: 'published',
      allowLateSubmission: false
    });

    const res = await request(app)
      .post(`/api/assignments/${assignment._id}/submissions`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'Too late' });

    expect(res.status).toBe(400);
  });

  test('student CAN submit late when the assignment allows late submissions, and it is flagged "late"', async () => {
    const { tokens, cls, subject, teacher } = await seedBaseFixtures();
    const assignment = await createPublishedAssignment({
      classId: cls._id,
      subjectId: subject._id,
      teacherId: teacher._id,
      deadline: pastDate(),
      maxMarks: 100,
      status: 'published',
      allowLateSubmission: true
    });

    const res = await request(app)
      .post(`/api/assignments/${assignment._id}/submissions`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'Late but allowed' });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('late');
  });

  test('student cannot submit the same assignment twice (must use update instead)', async () => {
    const { tokens, cls, subject, teacher } = await seedBaseFixtures();
    const assignment = await createPublishedAssignment({
      classId: cls._id,
      subjectId: subject._id,
      teacherId: teacher._id,
      deadline: futureDate(),
      maxMarks: 100,
      status: 'published'
    });

    await request(app)
      .post(`/api/assignments/${assignment._id}/submissions`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'First try' });

    const res = await request(app)
      .post(`/api/assignments/${assignment._id}/submissions`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'Second try' });

    expect(res.status).toBe(409);
  });

  test('student can update their submission before the deadline', async () => {
    const { tokens, cls, subject, teacher } = await seedBaseFixtures();
    const assignment = await createPublishedAssignment({
      classId: cls._id,
      subjectId: subject._id,
      teacherId: teacher._id,
      deadline: futureDate(),
      maxMarks: 100,
      status: 'published'
    });

    const createRes = await request(app)
      .post(`/api/assignments/${assignment._id}/submissions`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'Draft answer' });

    const res = await request(app)
      .put(`/api/submissions/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'Updated answer' });

    expect(res.status).toBe(200);
    expect(res.body.data.answerText).toBe('Updated answer');
  });

  test('student CANNOT update their submission after the deadline has passed', async () => {
    const { tokens, cls, subject, teacher } = await seedBaseFixtures();
    const assignment = await createPublishedAssignment({
      classId: cls._id,
      subjectId: subject._id,
      teacherId: teacher._id,
      deadline: new Date(Date.now() + 1000), // 1 second from now
      maxMarks: 100,
      status: 'published',
      allowLateSubmission: true
    });

    const createRes = await request(app)
      .post(`/api/assignments/${assignment._id}/submissions`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'Draft answer' });

    // Force the deadline into the past to simulate time passing
    await Assignment.findByIdAndUpdate(assignment._id, { deadline: pastDate() });

    const res = await request(app)
      .put(`/api/submissions/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'Too late to update' });

    expect(res.status).toBe(400);
  });

  test('a different student cannot update someone else\'s submission', async () => {
    const { tokens, cls, subject, teacher } = await seedBaseFixtures();
    const assignment = await createPublishedAssignment({
      classId: cls._id,
      subjectId: subject._id,
      teacherId: teacher._id,
      deadline: futureDate(),
      maxMarks: 100,
      status: 'published'
    });

    const createRes = await request(app)
      .post(`/api/assignments/${assignment._id}/submissions`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'Original' });

    const res = await request(app)
      .put(`/api/submissions/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({ answerText: 'Hijack attempt' });

    expect(res.status).toBe(403);
  });

  test('teacher can grade a submission and it becomes "graded"', async () => {
    const { tokens, cls, subject, teacher } = await seedBaseFixtures();
    const assignment = await createPublishedAssignment({
      classId: cls._id,
      subjectId: subject._id,
      teacherId: teacher._id,
      deadline: futureDate(),
      maxMarks: 100,
      status: 'published'
    });

    const createRes = await request(app)
      .post(`/api/assignments/${assignment._id}/submissions`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'Answer to grade' });

    const res = await request(app)
      .put(`/api/submissions/${createRes.body.data._id}/grade`)
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({ marks: 85, feedback: 'Good work' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('graded');
    expect(res.body.data.marks).toBe(85);
  });

  test('grading rejects marks above maxMarks', async () => {
    const { tokens, cls, subject, teacher } = await seedBaseFixtures();
    const assignment = await createPublishedAssignment({
      classId: cls._id,
      subjectId: subject._id,
      teacherId: teacher._id,
      deadline: futureDate(),
      maxMarks: 50,
      status: 'published'
    });

    const createRes = await request(app)
      .post(`/api/assignments/${assignment._id}/submissions`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'Answer' });

    const res = await request(app)
      .put(`/api/submissions/${createRes.body.data._id}/grade`)
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({ marks: 999 });

    expect(res.status).toBe(400);
  });

  test('a teacher cannot grade submissions for another teacher\'s assignment', async () => {
    const { tokens, cls, subject, teacher } = await seedBaseFixtures();
    const assignment = await createPublishedAssignment({
      classId: cls._id,
      subjectId: subject._id,
      teacherId: teacher._id,
      deadline: futureDate(),
      maxMarks: 100,
      status: 'published'
    });

    const createRes = await request(app)
      .post(`/api/assignments/${assignment._id}/submissions`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'Answer' });

    const res = await request(app)
      .put(`/api/submissions/${createRes.body.data._id}/grade`)
      .set('Authorization', `Bearer ${tokens.otherTeacher}`)
      .send({ marks: 40 });

    expect(res.status).toBe(403);
  });

  test('once graded, a student can no longer edit the submission', async () => {
    const { tokens, cls, subject, teacher } = await seedBaseFixtures();
    const assignment = await createPublishedAssignment({
      classId: cls._id,
      subjectId: subject._id,
      teacherId: teacher._id,
      deadline: futureDate(),
      maxMarks: 100,
      status: 'published'
    });

    const createRes = await request(app)
      .post(`/api/assignments/${assignment._id}/submissions`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'Answer' });

    await request(app)
      .put(`/api/submissions/${createRes.body.data._id}/grade`)
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({ marks: 90 });

    const res = await request(app)
      .put(`/api/submissions/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ answerText: 'Trying to change after grading' });

    expect(res.status).toBe(400);
  });
});
