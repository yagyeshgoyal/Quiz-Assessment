import { Trash2, ChevronRight, BookOpen } from 'lucide-react'

export default function ProfessorList({ professors, onSelect, onDelete }) {
  if (professors.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <div className="text-5xl mb-4 opacity-30">👤</div>
        <p className="text-sm">No professors found</p>
      </div>
    )
  }

  return (
    <div>
      {professors.map((prof) => (
        <div key={prof._id} className="list-item" onClick={() => onSelect(prof)}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-950/30 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <BookOpen size={16} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium">{prof.name}</p>
              <p className="text-xs text-muted mt-0.5">
                {prof.subjectCount || 0} subjects
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="badge badge-purple">{prof.subjectCount || 0} subjects</span>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(prof._id)}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}