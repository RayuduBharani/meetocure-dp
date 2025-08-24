const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = (roles = []) => {
  if (typeof roles === "string") roles = [roles];
  
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, authorization denied" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(401).json({ message: "User not found" });

      req.user = user;

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Access forbidden: insufficient rights" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Token is not valid or expired" });
    }
  };
};

module.exports = protect;
