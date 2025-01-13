import jwt from "jsonwebtoken";
import { models } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = async (req, res, next) => {

  const token =
    req?.cookies?.token || (req.headers?.authorization?.startsWith("Bearer")
      ? req?.headers?.authorization?.split(" ")[1]
      : null);

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    throw new Error("Unauthorized");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await models.User.findByPk(decoded.id);

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    throw new Error("Unauthorized");
  }

  req.user = user;
  next();
};

export const restrict = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden" });
      throw new Error("Forbidden");
    }
    next();
  };
}