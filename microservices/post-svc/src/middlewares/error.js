export default (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Erreur serveur interne";

  if (statusCode === 500) {
    console.error("Internal Server Error:", err);
  }

  res.status(statusCode).json({
    message: message,
  });
};
