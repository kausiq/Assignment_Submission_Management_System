const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { createClass, getClasses, getClass, updateClass, deleteClass } = require('../controllers/classController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getClasses)
  .post(authorize('admin'), [body('name').notEmpty().withMessage('Name is required')], validate, createClass);

router
  .route('/:id')
  .get(getClass)
  .put(authorize('admin'), updateClass)
  .delete(authorize('admin'), deleteClass);

module.exports = router;
