export default (req, res, next) => {
  const header = req.get('x-internal-secret')
  const secret = process.env.INTERNAL_SECRET

  if (header !== secret) {
    return res.status(403).json({ error: 'Accès refusé : header invalide' })
  }
  next()
}
