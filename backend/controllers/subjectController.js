const Subject = require('../models/Subject');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

// @desc    Create subject (admin only)
// @route   POST /api/subjects
const createSubject = async (req, res, next) => {
  try {
    const { name, code, classId, teachers } = req.body;

    if (teachers && teachers.length) {
      const count = await User.countDocuments({ _id: { $in: teachers }, role: 'teacher' });
      if (count !== teachers.length) {
        throw new ApiError(400, 'One or more provided teacher IDs are invalid or not teachers');
      }
    }

    const subject = await Subject.create({ name, code, classId, teachers: teachers || [] });
    res.status(201).json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

// @desc    List subjects (optionally by class or by teacher)
// @route   GET /api/subjects
const getSubjects = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.teacherId) filter.teachers = req.query.teacherId;

    if (req.user.role === 'teacher' && !req.query.classId) {
      filter.teachers = req.user._id;
    }

    const subjects = await Subject.find(filter)
      .populate('classId', 'name section')
      .populate('teachers', 'name email')
      .sort({ name: 1 });
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('classId', 'name section')
      .populate('teachers', 'name email');
    if (!subject) throw new ApiError(404, 'Subject not found');
    res.json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

// @desc    Update subject / assign teachers
// @route   PUT /api/subjects/:id
const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) throw new ApiError(404, 'Subject not found');

    const { name, code, classId, teachers } = req.body;
    if (name !== undefined) subject.name = name;
    if (code !== undefined) subject.code = code;
    if (classId !== undefined) subject.classId = classId;
    if (teachers !== undefined) subject.teachers = teachers;

    await subject.save();
    res.json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) throw new ApiError(404, 'Subject not found');
    await subject.deleteOne();
    res.json({ success: true, message: 'Subject deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createSubject, getSubjects, getSubject, updateSubject, deleteSubject };
