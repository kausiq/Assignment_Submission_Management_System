const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { createSubject, getSubjects, getSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getSubjects)
  .post(
    authorize('admin'),
    [body('name').notEmpty().withMessage('Name is required'), body('classId').isMongoId().withMessage('Valid classId is required')],
    validate,
    createSubject
  );

router
  .route('/:id')
  .get(getSubject)
  .put(authorize('admin'), updateSubject)
  .delete(authorize('admin'), deleteSubject);

module.exports = router;
