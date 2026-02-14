import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import Header from '../components/Header'
import SectionList from '../components/SectionList'
import Modal from '../components/Modal'
import ResultTable from '../components/ResultTable'
import { Plus, Clock, Trash2, CheckCircle, Edit3, BarChart2 } from 'lucide-react'

const LABELS = ['A', 'B', 'C', 'D']

export default function SubjectPage() {
  const navigate = useNavigate()
  const { subjectId } = useParams()
  const {
    professorToken, subjects, sections, results,
    fetchSections, addSection, deleteSection, updateTestConfig,
    addQuestion, deleteQuestion, fetchResults, loading
  } = useStore()

  const subject = subjects.find((s) => s._id === subjectId)
  const [selectedSection, setSelectedSection] = useState(null)
  const [view, setView] = useState('test') // 'test' | 'results'
  const [sectionModal, setSectionModal] = useState(false)
  const [sectionName, setSectionName] = useState('')
  const [configModal, setConfigModal] = useState(false)
  const [config, setConfig] = useState({ date: '', startTime: '', endTime: '', timeLimit: 30 })
  const [qModal, setQModal] = useState(false)
  const [qForm, setQForm] = useState({ text: '', options: ['', '', '', ''], correct: 0 })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!professorToken) { navigate('/professor/login'); return }
    if (subjectId) fetchSections(subjectId)
  }, [subjectId, professorToken])

  useEffect(() => {
    if (selectedSection) {
      setConfig(selectedSection.testConfig || { date: '', startTime: '', endTime: '', timeLimit: 30 })
      if (view === 'results') fetchResults(selectedSection._id)
    }
  }, [selectedSection, view])

  const handleAddSection = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!sectionName.trim()) { setFormError('Section name required.'); return }
    const created = await addSection(subjectId, sectionName.trim())
    if (created) { setSectionName(''); setSectionModal(false) }
  }

  const handleSaveConfig = async (e) => {
    e.preventDefault()
    if (!selectedSection) return
    await updateTestConfig(selectedSection._id, config)
    setConfigModal(false)
  }

  const handleAddQuestion = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!qForm.text.trim()) { setFormError('Question text required.'); return }
    if (qForm.options.some((o) => !o.trim())) { setFormError('All 4 options are required.'); return }
    if (!selectedSection) return
    const created = await addQuestion(selectedSection._id, qForm)
    if (created) { setQForm({ text: '', options: ['', '', '', ''], correct: 0 }); setQModal(false) }
  }

  const currentSection = selectedSection
    ? sections.find((s) => s._id === selectedSection._id)
    : null

  return (
    <div className="page min-h-screen flex flex-col">
      <div className="noise-overlay" />
      <Header
        title={`${subject?.name || 'Subject'}`}
        onBack={() => navigate('/professor')}
      />

      <div className="relative z-10 flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-border bg-surface/50 min-h-[calc(100vh-65px)] px-4 py-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Subject</p>
          <h2 className="font-display font-semibold text-accent mb-6 text-sm">{subject?.name}</h2>

          {/* Tabs */}
          <div className="flex flex-col gap-1 mb-6">
            {[{ key: 'test', label: 'Test Management', icon: Edit3 },
              { key: 'results', label: 'Results', icon: BarChart2 }].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all
                  ${view === key ? 'bg-accent text-bg font-semibold' : 'text-muted hover:text-[#e8eaf0] hover:bg-card'}`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <div className="h-px bg-border mb-4" />

          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Sections</p>
          <button
            className="btn btn-ghost btn-sm w-full justify-center mb-3"
            onClick={() => setSectionModal(true)}
          >
            <Plus size={13} /> Add Section
          </button>

          <SectionList
            sections={sections}
            selectedId={selectedSection?._id}
            onSelect={setSelectedSection}
            onDelete={(id) => {
              deleteSection(id)
              if (selectedSection?._id === id) setSelectedSection(null)
            }}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8 overflow-y-auto">
          {!currentSection ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted py-20">
                <div className="text-5xl mb-4 opacity-30">📋</div>
                <p className="text-sm">Select a section from the sidebar</p>
              </div>
            </div>
          ) : view === 'test' ? (
            /* ── TEST MANAGEMENT ── */
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">{currentSection.name} — Test Setup</h2>
                  <p className="text-muted text-xs mt-1">{currentSection.questions?.length || 0} questions</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfigModal(true)}>
                    <Clock size={13} /> Test Config
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setQModal(true)}>
                    <Plus size={13} /> Add Question
                  </button>
                </div>
              </div>

              {/* Config Summary */}
              <div className="card mb-6">
                <div className="flex flex-wrap gap-8">
                  {[['Date', currentSection.testConfig?.date || '—'],
                    ['Start', currentSection.testConfig?.startTime || '—'],
                    ['End', currentSection.testConfig?.endTime || '—'],
                    ['Time Limit', `${currentSection.testConfig?.timeLimit || 30} min`],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs text-muted uppercase tracking-widest mb-1">{label}</p>
                      <p className="font-mono text-sm font-medium">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions */}
              {(!currentSection.questions || currentSection.questions.length === 0) ? (
                <div className="text-center py-12 text-muted">
                  <div className="text-4xl mb-3 opacity-30">❓</div>
                  <p className="text-sm">No questions yet. Add your first question.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentSection.questions.map((q, idx) => (
                    <div key={q._id} className="card">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="badge badge-gold">Q{idx + 1}</span>
                            <p className="text-sm font-medium">{q.text}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, i) => (
                              <div
                                key={i}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border
                                  ${i === q.correct
                                    ? 'border-success/40 bg-emerald-950/20 text-success'
                                    : 'border-border bg-surface text-muted'}`}
                              >
                                <span className="font-mono font-bold">{LABELS[i]}</span>
                                {opt}
                                {i === q.correct && <CheckCircle size={11} className="ml-auto" />}
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          className="btn btn-danger btn-sm flex-shrink-0"
                          onClick={() => deleteQuestion(currentSection._id, q._id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── RESULTS ── */
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">{currentSection.name} — Results</h2>
                  <p className="text-muted text-xs mt-1">{results.length} submissions</p>
                </div>
                {results.length > 0 && (
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-xs text-muted uppercase tracking-widest">Avg Score</p>
                      <p className="font-mono text-xl font-bold text-accent">
                        {(results.reduce((a, r) => a + r.score, 0) / results.length).toFixed(1)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted uppercase tracking-widest">Max Score</p>
                      <p className="font-mono text-xl font-bold text-accent2">
                        {currentSection.questions?.length || 0}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <ResultTable results={results} maxScore={currentSection.questions?.length || 0} />
            </div>
          )}
        </main>
      </div>

      {/* Add Section Modal */}
      <Modal open={sectionModal} onClose={() => setSectionModal(false)} title="Add Section">
        <form onSubmit={handleAddSection} className="space-y-4">
          <div>
            <label className="form-label">Section Name</label>
            <input className="form-input" placeholder="e.g. CS-A" value={sectionName} onChange={(e) => setSectionName(e.target.value)} autoFocus />
          </div>
          {formError && <p className="text-danger text-sm">{formError}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn btn-ghost" onClick={() => setSectionModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}><Plus size={14} /> Add</button>
          </div>
        </form>
      </Modal>

      {/* Test Config Modal */}
      <Modal open={configModal} onClose={() => setConfigModal(false)} title="Test Configuration">
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={config.date} onChange={(e) => setConfig((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Time Limit (min)</label>
              <input type="number" min="5" className="form-input" value={config.timeLimit} onChange={(e) => setConfig((p) => ({ ...p, timeLimit: +e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Start Time</label>
              <input type="time" className="form-input" value={config.startTime} onChange={(e) => setConfig((p) => ({ ...p, startTime: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">End Time</label>
              <input type="time" className="form-input" value={config.endTime} onChange={(e) => setConfig((p) => ({ ...p, endTime: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn btn-ghost" onClick={() => setConfigModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Save Config</button>
          </div>
        </form>
      </Modal>

      {/* Add Question Modal */}
      <Modal open={qModal} onClose={() => setQModal(false)} title="Add Question" maxWidth="max-w-lg">
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div>
            <label className="form-label">Question Text</label>
            <textarea className="form-input resize-y" rows={3} placeholder="Enter the question..." value={qForm.text} onChange={(e) => setQForm((p) => ({ ...p, text: e.target.value }))} />
          </div>
          {LABELS.map((lbl, i) => (
            <div key={i}>
              <label className="form-label">Option {lbl}</label>
              <input className="form-input" placeholder={`Option ${lbl}`} value={qForm.options[i]} onChange={(e) => {
                const opts = [...qForm.options]; opts[i] = e.target.value
                setQForm((p) => ({ ...p, options: opts }))
              }} />
            </div>
          ))}
          <div>
            <label className="form-label">Correct Answer</label>
            <div className="grid grid-cols-2 gap-2">
              {LABELS.map((lbl, i) => (
                <label key={i} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all
                  ${qForm.correct === i ? 'border-success/50 bg-emerald-950/20 text-success' : 'border-border bg-surface text-muted hover:border-muted'}`}>
                  <input type="radio" name="correct" checked={qForm.correct === i} onChange={() => setQForm((p) => ({ ...p, correct: i }))} className="accent-success" />
                  <span className="text-xs font-mono font-bold">{lbl}</span>
                  <span className="text-xs truncate">{qForm.options[i] || '(empty)'}</span>
                </label>
              ))}
            </div>
          </div>
          {formError && <p className="text-danger text-sm">{formError}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn btn-ghost" onClick={() => setQModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}><Plus size={14} /> Add Question</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}