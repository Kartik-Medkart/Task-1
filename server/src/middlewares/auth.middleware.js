import jwt from "jsonwebtoken";
import { models } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {

  try {
    const token =
      req?.cookies?.token || (req.headers?.authorization?.startsWith("Bearer")
        ? req?.headers?.authorization?.split(" ")[1]
        : null);
  
    if (!token) {
      res.status(401).json(new ApiResponse(401, null,"Unauthorized"));
      // throw new ApiError(401, "Unauthorized");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await models.User.findByPk(decoded.id,{
      attributes: { exclude: ['password'] },
    });
  
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      // throw new ApiError(401, "Unauthorized");
    }
  
    req.user = user.toJSON();
    next();
  } catch (error) {
    if(error.name === 'TokenExpiredError'){
      res.status(401).clearCookie("token").json(new ApiResponse(401, null, "Token Expired"))
    };
  }
});

export const verifyUser = asyncHandler(async (req, res, next) => {
  try {
     if(!req.user.isVerified){
        res.status(401).json(new ApiResponse(401, [], "Please Verify Your Phone Number"));
     }
     next();
  } catch (error) {
      console.log(error);
      return res.status(500).json(new ApiResponse(500, [], "Internal Server Error"));
  }
});

export const restrict = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(new ApiResponse(403, null, "Forbidden"));
    }
    next();
  };
}