import { useStore } from '../context/StoreContext'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

export default function NavigationButtons({ onSubmit }) {
  const { testState, navigateQuestion } = useStore()
  const { currentIndex, questions } = testState
  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1

  return (
    <div className="flex items-center justify-between mt-6">
      <button
        className="btn btn-ghost"
        onClick={() => navigateQuestion(-1)}
        disabled={isFirst}
        style={{ opacity: isFirst ? 0.4 : 1 }}
      >
        <ChevronLeft size={15} /> Previous
      </button>

      <div className="flex gap-3">
        {!isLast && (
          <button className="btn btn-ghost" onClick={() => navigateQuestion(1)}>
            Next <ChevronRight size={15} />
          </button>
        )}
        {isLast && (
          <button className="btn btn-primary" onClick={onSubmit}>
            <CheckCircle size={15} /> Submit Test
          </button>
        )}
      </div>
    </div>
  )
}