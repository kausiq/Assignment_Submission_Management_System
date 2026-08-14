const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { ApiError } = require('../middleware/errorHandler');

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user);
    res.json({
      success: true,
      data: {
        token,
        user: user.toSafeObject()
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently logged in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('classId', 'name section');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe };
