export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      const data = schema.parse(req[source]);
      req.validated = data;
      next();
    } catch (error) {
      return res.status(400).json({ error: error.errors });
    }
  };
};
