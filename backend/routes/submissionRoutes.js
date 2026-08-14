const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  updateSubmission,
  getSubmissions,
  getSubmission,
  gradeSubmission,
  updateSubmissionStatus
} = require('../controllers/submissionController');

const router = express.Router();

router.use(protect);

router.get('/', getSubmissions);

router
  .route('/:id')
  .get(getSubmission)
  .put(authorize('student'), updateSubmission);

router.put(
  '/:id/grade',
  authorize('teacher', 'admin'),
  [body('marks').optional().isFloat({ min: 0 }).withMessage('marks must be a non-negative number')],
  validate,
  gradeSubmission
);

router.put('/:id/status', authorize('teacher', 'admin'), updateSubmissionStatus);

module.exports = router;
