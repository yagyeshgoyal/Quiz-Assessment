const errorHandler = (err, req, res, next) => {
  console.error('❌', err.stack || err.message)
  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500)
  const message =
    err.name === 'CastError'
      ? 'Invalid ID format'
      : err.code === 11000
      ? 'Duplicate entry — this already exists.'
      : err.message || 'Internal Server Error'

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({ message, stack: err.stack })
  }
  res.status(statusCode).json({ message })
}

module.exports = errorHandler