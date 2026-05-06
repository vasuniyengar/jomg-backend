import jwt from "jsonwebtoken";
import User from "../models/User.js";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_JWT_SECRET || process.env.JWT_SECRET;

const authenticate = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];

    // if token not available
    if (!accessToken) {
      return res.status(401).json({ error: true, message: "Token missing" });
    }

    //if token available verification
    if (!ACCESS_TOKEN_SECRET) {
      return res.status(500).json({
        error: true,
        message:
          "JWT secret missing. Set ACCESS_TOKEN_JWT_SECRET or JWT_SECRET.",
      });
    }
    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);

    //finding user with payload id sent to token
    const user = await User.findByPk(decoded.id);

    //if user not exists
    if (!user) {
      return res.status(401).json({ error: true, message: "User not found" });
    }

    const userTokenVersion = user.tokenVersion || 0;
    const tokenVersion = decoded.tokenVersion;
    if (tokenVersion !== userTokenVersion) {
      return res.status(401).json({ error: true, message: "Invalid token" });
    }

    //if users exists sent user data with request
    req.user = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      gender: user.gender,
      email: user.email,
      roles: decoded.roles,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: true, message: "Invalid token" });
  }
};

const authorizeRole = (allowedRoles = []) => (req, res, next) => {
  const roles = req.user?.roles || [];
  const matched = allowedRoles.some((role) => roles.includes(role));
  if (!matched) {
    return res.status(403).json({
      error: true,
      code: 403,
      message: "Forbidden: Access denied",
    });
  }
  return next();
};

export default { authenticate, authorizeRole };
