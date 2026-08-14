const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

// @desc    Create a new user (admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, classId } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new ApiError(409, 'A user with this email already exists');

    if (role === 'student' && !classId) {
      throw new ApiError(400, 'classId is required for students');
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      classId: role === 'student' ? classId : null
    });

    res.status(201).json({ success: true, data: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc    List users (optionally filter by role)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.classId) filter.classId = req.query.classId;

    const users = await User.find(filter).populate('classId', 'name section').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('classId', 'name section');
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, role, classId, isActive, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (classId !== undefined) user.classId = classId;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password; // triggers pre-save hash

    await user.save();
    res.json({ success: true, data: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete (deactivate) user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createUser, getUsers, getUser, updateUser, deleteUser };
