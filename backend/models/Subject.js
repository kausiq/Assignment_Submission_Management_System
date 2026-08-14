const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, default: '' },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

subjectSchema.index({ name: 1, classId: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
