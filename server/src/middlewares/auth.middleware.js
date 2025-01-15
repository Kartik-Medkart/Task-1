import jwt from "jsonwebtoken";
import { models } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {

  const token =
    req?.cookies?.token || (req.headers?.authorization?.startsWith("Bearer")
      ? req?.headers?.authorization?.split(" ")[1]
      : null);

  if (!token) {
    res.status(401).json(new ApiResponse(401, null,"Unauthorized"));
    throw new ApiError(401, "Unauthorized");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await models.User.findByPk(decoded.id,{
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    throw new ApiError("Unauthorized");
  }

  req.user = user.toJSON();
  next();
});

export const restrict = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(new ApiResponse(403, null, "Forbidden"));
    }
    next();
  };
}