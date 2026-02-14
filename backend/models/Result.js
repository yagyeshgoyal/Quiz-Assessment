const mongoose = require('mongoose')

const resultSchema = new mongoose.Schema(
  {
    rollNo:    { type: String, required: true, trim: true },
    section:   { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    subject:   { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
    score:     { type: Number, required: true },
    total:     { type: Number, required: true },
    answers: [
      {
        questionId:     { type: mongoose.Schema.Types.ObjectId },
        selectedOption: { type: Number },
        isCorrect:      { type: Boolean },
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Result', resultSchema)