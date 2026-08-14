const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');
const { createSubmission } = require('../controllers/submissionController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAssignments)
  .post(
    authorize('teacher', 'admin'),
    [
      body('title').notEmpty().withMessage('Title is required'),
      body('description').notEmpty().withMessage('Description is required'),
      body('classId').isMongoId().withMessage('Valid classId is required'),
      body('subjectId').isMongoId().withMessage('Valid subjectId is required'),
      body('deadline').isISO8601().withMessage('Valid deadline date is required'),
      body('maxMarks').isFloat({ min: 1 }).withMessage('maxMarks must be a positive number')
    ],
    validate,
    createAssignment
  );


router
  .route('/:id')
  .get(getAssignment)
  .put(authorize('teacher', 'admin'), updateAssignment)
  .delete(authorize('teacher', 'admin'), deleteAssignment);


router.post(
  '/:assignmentId/submissions',
  authorize('student'),
  [body('answerText').notEmpty().withMessage('answerText is required')],
  validate,
  createSubmission
);

module.exports = router;
