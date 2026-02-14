// Format seconds to MM:SS
export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Get timer color based on time remaining
export const getTimerColor = (timeLeft, totalTime) => {
  const pct = timeLeft / totalTime
  if (pct < 0.15) return 'text-danger'
  if (pct < 0.35) return 'text-accent'
  return 'text-success'
}

// Calculate percentage
export const calcPct = (score, total) =>
  total > 0 ? Math.round((score / total) * 100) : 0

// Status label and class from percentage
export const getStatus = (pct) => {
  if (pct >= 70) return { label: 'Pass', cls: 'badge-green' }
  if (pct >= 40) return { label: 'Average', cls: 'badge-gold' }
  return { label: 'Fail', cls: 'badge-red' }
}

// Truncate long text
export const truncate = (str, max = 60) =>
  str?.length > max ? str.slice(0, max) + '…' : str