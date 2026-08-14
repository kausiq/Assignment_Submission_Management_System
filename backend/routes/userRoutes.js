const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { createUser, getUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.use(protect, authorize('admin'));

router
  .route('/')
  .get(getUsers)
  .post(
    [
      body('name').notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('role').isIn(['admin', 'teacher', 'student']).withMessage('Role must be admin, teacher or student')
    ],
    validate,
    createUser
  );

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
