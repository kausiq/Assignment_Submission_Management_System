const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date, required: true },
    maxMarks: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    allowLateSubmission: { type: Boolean, default: false },
    allowResubmissionBeforeDeadline: { type: Boolean, default: true }
  },
  { timestamps: true }
);

assignmentSchema.index({ classId: 1, subjectId: 1, status: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
