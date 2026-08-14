const Class = require('../models/Class');
const { ApiError } = require('../middleware/errorHandler');

// @desc    Create class/course (admin only)
// @route   POST /api/classes
const createClass = async (req, res, next) => {
  try {
    const { name, section, description } = req.body;
    const cls = await Class.create({ name, section, description });
    res.status(201).json({ success: true, data: cls });
  } catch (err) {
    next(err);
  }
};

// @desc    List all classes
// @route   GET /api/classes
const getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find().sort({ name: 1, section: 1 });
    res.json({ success: true, count: classes.length, data: classes });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
const getClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) throw new ApiError(404, 'Class not found');
    res.json({ success: true, data: cls });
  } catch (err) {
    next(err);
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
const updateClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) throw new ApiError(404, 'Class not found');
    Object.assign(cls, req.body);
    await cls.save();
    res.json({ success: true, data: cls });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
const deleteClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) throw new ApiError(404, 'Class not found');
    await cls.deleteOne();
    res.json({ success: true, message: 'Class deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createClass, getClasses, getClass, updateClass, deleteClass };
