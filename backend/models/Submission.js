const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answerText: { type: String, required: true, trim: true },
    attachmentUrl: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['submitted', 'late', 'graded'],
      default: 'submitted'
    },
    marks: { type: Number, default: null, min: 0 },
    feedback: { type: String, default: '', trim: true },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date, default: null },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
