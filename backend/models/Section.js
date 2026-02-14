const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: { type: [String], validate: (v) => v.length === 4 },
  correct: { type: Number, required: true, min: 0, max: 3 },
})

const testConfigSchema = new mongoose.Schema({
  date:      { type: String, default: '' },
  startTime: { type: String, default: '' },
  endTime:   { type: String, default: '' },
  timeLimit: { type: Number, default: 30 }, // minutes
})

const sectionSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    subject:    { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    professor:  { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
    testConfig: { type: testConfigSchema, default: () => ({}) },
    questions:  [questionSchema],
  },
  { timestamps: true }
)

sectionSchema.index({ name: 1, subject: 1 }, { unique: true })

module.exports = mongoose.model('Section', sectionSchema)