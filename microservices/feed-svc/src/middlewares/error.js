export default (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500
  const message = err.message || 'Erreur serveur interne'
  res.status(statusCode).json({ message })
}
