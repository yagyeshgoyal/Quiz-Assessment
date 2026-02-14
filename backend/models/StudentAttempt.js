const mongoose = require('mongoose')

const studentAttemptSchema = new mongoose.Schema(
  {
    rollNo:    { type: String, required: true, trim: true },
    section:   { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    subject:   { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// Unique constraint: one attempt per roll+section+subject
studentAttemptSchema.index({ rollNo: 1, section: 1, subject: 1 }, { unique: true })

module.exports = mongoose.model('StudentAttempt', studentAttemptSchema)