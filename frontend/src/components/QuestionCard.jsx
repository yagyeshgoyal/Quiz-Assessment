import { useStore } from '../context/StoreContext'

const LABELS = ['A', 'B', 'C', 'D']

export default function QuestionCard() {
  const { testState, selectAnswer } = useStore()
  const { questions, currentIndex, answers } = testState
  const q = questions[currentIndex]
  if (!q) return null

  const selected = answers[q._id]

  return (
    <div className="card animate-fadeUp">
      {/* Question Header */}
      <div className="mb-6">
        <span className="badge badge-gold mb-3">Q{currentIndex + 1}</span>
        <p className="text-base font-medium leading-relaxed text-[#e8eaf0]">{q.text}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {q.shuffledOptions.map((opt, idx) => {
          const isSelected = selected === opt.origIndex
          return (
            <button
              key={idx}
              onClick={() => selectAnswer(q._id, opt.origIndex)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200
                ${isSelected
                  ? 'border-accent bg-yellow-950/30 text-accent'
                  : 'border-border bg-surface text-[#e8eaf0] hover:border-accent2 hover:bg-blue-950/20'
                }`}
            >
              <span className={`w-7 h-7 flex-shrink-0 rounded-md flex items-center justify-center text-xs font-bold transition-all
                ${isSelected ? 'bg-accent text-bg' : 'bg-card border border-border text-muted'}`}>
                {LABELS[idx]}
              </span>
              <span className="text-sm">{opt.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}