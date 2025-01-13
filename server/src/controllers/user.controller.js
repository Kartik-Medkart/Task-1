import { models } from "../db/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const { User } = models;

const validateAndTrimEmail = (email) => {
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    throw new ApiError(400, "Invalid email format");
  }
  return trimmedEmail;
};

export const createUser = asyncHandler(async (req, res) => {
  console.log("Create User Controller");
  const { username, firstName, lastName, email, password, role } = req.body;

  if (!username || !email || !password) {
    res
      .status(400)
      .json(new ApiError(400, "Username, email and password are required"));
    throw new Error(400, "Username, email and password are required");
  }

  const verifiedEmail = validateAndTrimEmail(email);
  console.log(verifiedEmail);

  const user = await User.findOne({ where: { email : verifiedEmail } });

  console.log(user);

  if (user) {
    res
      .status(400)
      .json(new ApiError(400, "User with this email already exists"));
    throw new Error(400, "User with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    email,
    password: passwordHash,
    firstName,
    lastName,
    role,
  });

  res
    .status(201)
    .json(new ApiResponse(201, newUser, "User Created Successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  console.log("Login User Controller");
  const { email, password } = req.body;

  const verifiedEmail = validateAndTrimEmail(email);

  if(email && !verifiedEmail){
    res.status(400).json(new ApiError(400, "Invalid email format"));
    throw new Error(400, "Invalid email format");
  }

  if (!verifiedEmail || !password) {
    res.status(400).json(new ApiError(400, "Email and Password are required"));
    throw new Error(400, "Email and password are required");
  }

  const user = await User.findOne({ where: { email : verifiedEmail } });

  if (!user) {
    res.status(401).json(new ApiError(401, "user Not Found"));
    throw new Error(401, "user Not Found");
  }

  if(!(await bcrypt.compare(password, user.password))) {
    res.status(401).json(new ApiError(401, "Invalid email or password"));
    throw new Error(401, "Invalid email or password");
  }

  console.log(process.env.JWT_SECRET);

  const token = jwt.sign(
    { id: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    })
    .json(new ApiResponse(200, { token, user }, "Login Successful"));
});


export const logoutUser = asyncHandler(async (req, res) => {

  res
    .status(200)
    .clearCookie("token")
    .json(new ApiResponse(200, {}, "Logout Successful"));
});

export const updateToken = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.user_id);

  const token = jwt.sign(
    { id: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res
    .status(200)
    .setCookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    })
    .json(new ApiResponse(200, { token, user }, "Token Updated Successfully"));
});

export const getUserProfile = asyncHandler(async (req, res) => {
    
    const user = await User.findByPk(req.user.user_id, {
        attributes: { exclude: ["password"] },
    });
    
    res.status(200).json(new ApiResponse(200, user, "User Profile"));
});