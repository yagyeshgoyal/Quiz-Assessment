import { Trash2, Layers } from 'lucide-react'

export default function SectionList({ sections, selectedId, onSelect, onDelete }) {
  if (sections.length === 0) {
    return (
      <p className="text-xs text-muted text-center py-4">No sections yet</p>
    )
  }

  return (
    <div className="space-y-1">
      {sections.map((sec) => {
        const isActive = sec._id === selectedId
        return (
          <div
            key={sec._id}
            onClick={() => onSelect(sec)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 border
              ${isActive
                ? 'border-accent/40 bg-yellow-950/20 text-accent'
                : 'border-transparent hover:border-border hover:bg-surface text-[#e8eaf0]'}`}
          >
            <div className="flex items-center gap-2">
              <Layers size={13} className={isActive ? 'text-accent' : 'text-muted'} />
              <span className="text-sm font-medium">{sec.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted font-mono">
                {sec.questions?.length || 0}Q
              </span>
              <button
                className="btn btn-danger btn-sm p-1"
                onClick={(e) => { e.stopPropagation(); onDelete(sec._id) }}
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}