const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, 
    section: { type: String, trim: true, default: '' }, 
    description: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

classSchema.index({ name: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
