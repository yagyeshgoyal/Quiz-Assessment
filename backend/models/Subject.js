const mongoose = require('mongoose')

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
  },
  { timestamps: true }
)

// Compound unique index: same professor can't have two subjects with same name
subjectSchema.index({ name: 1, professor: 1 }, { unique: true })

module.exports = mongoose.model('Subject', subjectSchema)