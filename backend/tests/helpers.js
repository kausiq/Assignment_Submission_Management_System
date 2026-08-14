const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');

/**
 * Creates a full base fixture set: a class, a subject, an admin, a teacher
 * (assigned to the subject) and a student (enrolled in the class).
 * Returns each user together with a valid JWT obtained via the real login route.
 */
const seedBaseFixtures = async () => {
  const cls = await Class.create({ name: 'Class 9', section: 'A' });

  const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'Password1', role: 'admin' });
  const teacher = await User.create({ name: 'Teacher', email: 'teacher@test.com', password: 'Password1', role: 'teacher' });
  const otherTeacher = await User.create({ name: 'Other Teacher', email: 'teacher2@test.com', password: 'Password1', role: 'teacher' });
  const student = await User.create({ name: 'Student', email: 'student@test.com', password: 'Password1', role: 'student', classId: cls._id });

  const subject = await Subject.create({ name: 'Science', classId: cls._id, teachers: [teacher._id] });

  const loginAs = async (email) => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'Password1' });
    return res.body.data.token;
  };

  return {
    cls,
    subject,
    admin,
    teacher,
    otherTeacher,
    student,
    tokens: {
      admin: await loginAs(admin.email),
      teacher: await loginAs(teacher.email),
      otherTeacher: await loginAs(otherTeacher.email),
      student: await loginAs(student.email)
    }
  };
};

module.exports = { seedBaseFixtures };
