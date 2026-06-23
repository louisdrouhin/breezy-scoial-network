export default (req, res, next) => {
  const secretHeader = req.get("x-internal-secret") || req.get("x-api-key");
  const secret = process.env.INTERNAL_SECRET || process.env.INTERNAL_API_KEY || "test-key-123";

  if (!secretHeader || secretHeader !== secret) {
    return res.status(403).json({ error: "Accès refusé : secret interne invalide" });
  }
  next();
};
