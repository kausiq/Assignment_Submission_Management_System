
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

const run = async () => {
  await connectDB();

  logger.info('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Class.deleteMany({}),
    Subject.deleteMany({}),
    Assignment.deleteMany({}),
    Submission.deleteMany({})
  ]);

  logger.info('Creating classes...');
  const [classTen, classEleven] = await Class.create([
    { name: 'Class 10', section: 'A', description: 'Secondary school, section A' },
    { name: 'Class 11', section: 'B', description: 'Higher secondary, section B' }
  ]);

  logger.info('Creating users...');
  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@school.test',
    password: 'Admin@123',
    role: 'admin'
  });

  const teacher = await User.create({
    name: 'Rahim Uddin',
    email: 'teacher@school.test',
    password: 'Teacher@123',
    role: 'teacher'
  });

  const teacher2 = await User.create({
    name: 'Karim Ahmed',
    email: 'teacher2@school.test',
    password: 'Teacher@123',
    role: 'teacher'
  });

  const student = await User.create({
    name: 'Ayesha Khan',
    email: 'student@school.test',
    password: 'Student@123',
    role: 'student',
    classId: classTen._id
  });

  const student2 = await User.create({
    name: 'Tanvir Islam',
    email: 'student2@school.test',
    password: 'Student@123',
    role: 'student',
    classId: classTen._id
  });

  logger.info('Creating subjects...');
  const math = await Subject.create({
    name: 'Mathematics',
    code: 'MATH101',
    classId: classTen._id,
    teachers: [teacher._id]
  });

  const english = await Subject.create({
    name: 'English',
    code: 'ENG101',
    classId: classTen._id,
    teachers: [teacher2._id]
  });

  logger.info('Creating assignments...');
  const futureDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  const pastDeadline = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

  const activeAssignment = await Assignment.create({
    title: 'Algebra Homework 1',
    description: 'Solve chapter 3 exercises 1-10 and show your work.',
    classId: classTen._id,
    subjectId: math._id,
    teacherId: teacher._id,
    deadline: futureDeadline,
    maxMarks: 100,
    status: 'published',
    allowLateSubmission: true
  });

  await Assignment.create({
    title: 'Essay: My Summer Vacation',
    description: 'Write a 500-word essay about your summer vacation experiences.',
    classId: classTen._id,
    subjectId: english._id,
    teacherId: teacher2._id,
    deadline: pastDeadline,
    maxMarks: 50,
    status: 'published',
    allowLateSubmission: false
  });

  await Assignment.create({
    title: 'Geometry Draft Assignment',
    description: 'Draft assignment not yet published to students.',
    classId: classTen._id,
    subjectId: math._id,
    teacherId: teacher._id,
    deadline: futureDeadline,
    maxMarks: 80,
    status: 'draft'
  });

  logger.info('Creating a sample submission...');
  await Submission.create({
    assignmentId: activeAssignment._id,
    studentId: student2._id,
    answerText: 'Here are my answers to exercises 1 through 10: ...',
    status: 'submitted'
  });

  logger.info('Seed complete. Demo credentials:');
  logger.info(`  Admin    -> email: admin@school.test    password: Admin@123`);
  logger.info(`  Teacher  -> email: teacher@school.test  password: Teacher@123`);
  logger.info(`  Teacher2 -> email: teacher2@school.test password: Teacher@123`);
  logger.info(`  Student  -> email: student@school.test  password: Student@123`);
  logger.info(`  Student2 -> email: student2@school.test password: Student@123`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Seeding failed: ${err.message}`);
  process.exit(1);
});
