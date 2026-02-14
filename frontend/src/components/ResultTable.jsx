import { calcPct, getStatus } from '../utils/helpers'

export default function ResultTable({ results, maxScore }) {
  if (results.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <div className="text-5xl mb-4 opacity-30">📊</div>
        <p className="text-sm">No results yet for this section</p>
      </div>
    )
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-widest">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-widest">Roll No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-widest">Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-widest">Max</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-widest">Percentage</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.slice(0, 200).map((r, i) => {
              const pct = calcPct(r.score, r.total)
              const { label, cls } = getStatus(pct)
              return (
                <tr key={r._id || i} className="border-b border-border/40 hover:bg-white/[0.01] transition-colors">
                  <td className="px-4 py-3 text-muted font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-mono font-medium">{r.rollNo}</td>
                  <td className="px-4 py-3 font-mono text-accent font-semibold">{r.score}</td>
                  <td className="px-4 py-3 font-mono text-muted">{r.total}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 70 ? 'bg-success' : pct >= 40 ? 'bg-accent' : 'bg-danger'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${cls}`}>{label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}