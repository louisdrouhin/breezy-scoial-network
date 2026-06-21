export const extractUser = (req, res, next) => {
  const username = req.headers["x-user-username"];
  const role = req.headers["x-user-role"];

  if (username) {
    req.user = { username, role };
  }

  next();
};

export const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.username) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};
