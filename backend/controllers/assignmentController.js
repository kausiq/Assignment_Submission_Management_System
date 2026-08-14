const Assignment = require('../models/Assignment');
const Subject = require('../models/Subject');
const Submission = require('../models/Submission');
const { ApiError } = require('../middleware/errorHandler');

const assertTeacherOwnsSubject = async (subjectId, teacherUser) => {
  const subject = await Subject.findById(subjectId);
  if (!subject) throw new ApiError(404, 'Subject not found');

  if (teacherUser.role === 'admin') return subject;

  const isAssigned = subject.teachers.some((t) => t.toString() === teacherUser._id.toString());
  if (!isAssigned) {
    throw new ApiError(403, 'You are not assigned to teach this subject');
  }
  return subject;
};


const createAssignment = async (req, res, next) => {
  try {
    const { title, description, classId, subjectId, deadline, maxMarks, status, allowLateSubmission, allowResubmissionBeforeDeadline } = req.body;

    const subject = await assertTeacherOwnsSubject(subjectId, req.user);
    if (subject.classId.toString() !== classId) {
      throw new ApiError(400, 'The selected subject does not belong to the selected class');
    }

    const assignment = await Assignment.create({
      title,
      description,
      classId,
      subjectId,
      teacherId: req.user.role === 'admin' ? req.body.teacherId || req.user._id : req.user._id,
      deadline,
      maxMarks,
      status: status === 'published' ? 'published' : 'draft',
      allowLateSubmission: !!allowLateSubmission,
      allowResubmissionBeforeDeadline: allowResubmissionBeforeDeadline !== undefined ? !!allowResubmissionBeforeDeadline : true
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};


const getAssignments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.status) filter.status = req.query.status;

    if (req.user.role === 'student') {
      
      if (!req.user.classId) {
        return res.json({ success: true, count: 0, data: [] });
      }
      filter.classId = req.user.classId;
      filter.status = 'published';
    } else if (req.user.role === 'teacher') {
      if (!req.query.all) {
        filter.teacherId = req.user._id;
      }
    }
    // admin: no extra restriction, sees everything

    const assignments = await Assignment.find(filter)
      .populate('classId', 'name section')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
const getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('classId', 'name section')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name email');

    if (!assignment) throw new ApiError(404, 'Assignment not found');

    if (req.user.role === 'student') {
      const belongsToClass = assignment.classId._id.toString() === (req.user.classId || '').toString();
      if (!belongsToClass || assignment.status !== 'published') {
        throw new ApiError(404, 'Assignment not found');
      }
    }

    if (req.user.role === 'teacher' && assignment.teacherId._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You do not have access to this assignment');
    }

    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

// @desc    Update assignment (owning teacher or admin)
// @route   PUT /api/assignments/:id
const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new ApiError(404, 'Assignment not found');

    if (req.user.role === 'teacher' && assignment.teacherId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only update your own assignments');
    }

    const fields = ['title', 'description', 'deadline', 'maxMarks', 'status', 'allowLateSubmission', 'allowResubmissionBeforeDeadline'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) assignment[f] = req.body[f];
    });

    await assignment.save();
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete assignment (owning teacher or admin)
// @route   DELETE /api/assignments/:id
const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new ApiError(404, 'Assignment not found');

    if (req.user.role === 'teacher' && assignment.teacherId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only delete your own assignments');
    }

    await Submission.deleteMany({ assignmentId: assignment._id });
    await assignment.deleteOne();
    res.json({ success: true, message: 'Assignment and its submissions deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createAssignment, getAssignments, getAssignment, updateAssignment, deleteAssignment };
