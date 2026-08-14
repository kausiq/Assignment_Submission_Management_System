const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { ApiError } = require('../middleware/errorHandler');

// @desc    Student submits an answer for a published assignment
// @route   POST /api/assignments/:assignmentId/submissions
// @access  Private/Student
const createSubmission = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { answerText, attachmentUrl } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || assignment.status !== 'published') {
      throw new ApiError(404, 'Assignment not found or not published');
    }

    if (assignment.classId.toString() !== (req.user.classId || '').toString()) {
      throw new ApiError(403, 'This assignment is not assigned to your class');
    }

    const now = new Date();
    const isLate = now > assignment.deadline;
    if (isLate && !assignment.allowLateSubmission) {
      throw new ApiError(400, 'The deadline has passed and late submissions are not allowed for this assignment');
    }

    const existing = await Submission.findOne({ assignmentId, studentId: req.user._id });
    if (existing) {
      throw new ApiError(409, 'You have already submitted this assignment. Use update instead.');
    }

    const submission = await Submission.create({
      assignmentId,
      studentId: req.user._id,
      answerText,
      attachmentUrl,
      status: isLate ? 'late' : 'submitted',
      submittedAt: now
    });

    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

// @desc    Student updates their own submission before the deadline (if allowed)
// @route   PUT /api/submissions/:id
// @access  Private/Student
const updateSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) throw new ApiError(404, 'Submission not found');

    if (submission.studentId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only update your own submission');
    }

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) throw new ApiError(404, 'Related assignment not found');

    if (submission.status === 'graded') {
      throw new ApiError(400, 'This submission has already been graded and can no longer be edited');
    }

    const now = new Date();
    if (now > assignment.deadline) {
      throw new ApiError(400, 'The deadline has passed, this submission can no longer be updated');
    }

    if (!assignment.allowResubmissionBeforeDeadline) {
      throw new ApiError(400, 'Updates are not allowed for this assignment once submitted');
    }

    const { answerText, attachmentUrl } = req.body;
    if (answerText !== undefined) submission.answerText = answerText;
    if (attachmentUrl !== undefined) submission.attachmentUrl = attachmentUrl;
    submission.submittedAt = now;

    await submission.save();
    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

// @desc    List submissions (role-aware): teacher sees submissions for their assignments,
//          student sees only their own, admin sees all
// @route   GET /api/submissions
// @access  Private
const getSubmissions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.assignmentId) filter.assignmentId = req.query.assignmentId;

    if (req.user.role === 'student') {
      filter.studentId = req.user._id;
    } else if (req.user.role === 'teacher') {
      // restrict to assignments owned by this teacher
      const ownedAssignments = await Assignment.find({ teacherId: req.user._id }).select('_id');
      const ownedIds = ownedAssignments.map((a) => a._id);
      filter.assignmentId = filter.assignmentId
        ? filter.assignmentId
        : { $in: ownedIds };

      if (req.query.assignmentId && !ownedIds.map(String).includes(req.query.assignmentId)) {
        throw new ApiError(403, 'You do not have access to submissions for this assignment');
      }
    }

    const submissions = await Submission.find(filter)
      .populate('studentId', 'name email')
      .populate({
        path: 'assignmentId',
        select: 'title deadline maxMarks classId subjectId teacherId',
        populate: [
          { path: 'classId', select: 'name section' },
          { path: 'subjectId', select: 'name code' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
const getSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('assignmentId');

    if (!submission) throw new ApiError(404, 'Submission not found');

    if (req.user.role === 'student' && submission.studentId._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You do not have access to this submission');
    }

    if (req.user.role === 'teacher' && submission.assignmentId.teacherId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You do not have access to this submission');
    }

    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

// @desc    Teacher grades a submission (marks + feedback)
// @route   PUT /api/submissions/:id/grade
// @access  Private/Teacher
const gradeSubmission = async (req, res, next) => {
  try {
    const { marks, feedback } = req.body;
    const submission = await Submission.findById(req.params.id).populate('assignmentId');
    if (!submission) throw new ApiError(404, 'Submission not found');

    const assignment = submission.assignmentId;
    if (req.user.role === 'teacher' && assignment.teacherId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only grade submissions for your own assignments');
    }

    if (marks !== undefined) {
      if (marks < 0 || marks > assignment.maxMarks) {
        throw new ApiError(400, `Marks must be between 0 and ${assignment.maxMarks}`);
      }
      submission.marks = marks;
    }
    if (feedback !== undefined) submission.feedback = feedback;

    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;

    await submission.save();
    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

// @desc    Teacher manually changes a submission's status (e.g. revert grading)
// @route   PUT /api/submissions/:id/status
// @access  Private/Teacher
const updateSubmissionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['submitted', 'late', 'graded'];
    if (!allowed.includes(status)) {
      throw new ApiError(400, `Status must be one of: ${allowed.join(', ')}`);
    }

    const submission = await Submission.findById(req.params.id).populate('assignmentId');
    if (!submission) throw new ApiError(404, 'Submission not found');

    if (req.user.role === 'teacher' && submission.assignmentId.teacherId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only update submissions for your own assignments');
    }

    submission.status = status;
    await submission.save();
    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSubmission,
  updateSubmission,
  getSubmissions,
  getSubmission,
  gradeSubmission,
  updateSubmissionStatus
};
