import { models } from "../db/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const { User } = models;

export const createUser = asyncHandler(async (req, res) => {
  const { username, firstName, lastName, email, password, role } = req.body;

  if (!username || !email || !password) {
    res
      .status(400)
      .json(new ApiError(400, "Username, email and password are required"));
    throw new Error(400, "Username, email and password are required");
  }

  const user = await User.findOne({ where: { email } });

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
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json(new ApiError(400, "Email and Password are required"));
    throw new Error(400, "Email and password are required");
  }

  console.log(req.body);

  const user = await User.findOne({ where: { email } });
  console.log(user);

  if (!user) {
    res.status(401).json(new ApiError(401, "user Not Found"));
    throw new Error(401, "user Not Found");
  }

  if(!(await bcrypt.compare(password, user.password))) {
    res.status(401).json(new ApiError(401, "Invalid email or password"));
    throw new Error(401, "Invalid email or password");
  }

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
    .json(new ApiResponse(200, { token, user }, "Login Successful"));
});


export const logoutUser = asyncHandler(async (req, res) => {

  res
    .status(200)
    .clearCookie("token")
    .json(new ApiResponse(200, {}, "Logout Successful"));
});

export const getUserProfile = asyncHandler(async (req, res) => {
    
    const user = await User.findByPk(req.user.user_id, {
        attributes: { exclude: ["password"] },
    });
    
    res.status(200).json(new ApiResponse(200, user, "User Profile"));
});