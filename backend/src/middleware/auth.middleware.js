const { verifyToken } = require("../utils/jwt");

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  return undefined;
};