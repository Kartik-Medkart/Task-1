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
    return null;
  }
  return trimmedEmail;
};

export const createUser = asyncHandler(async (req, res) => {
  console.log("Create User Controller");
  const { username, firstName, lastName, email, password, phone, address, city, state, role } = req.body;

  if (!username || !email || !password || !phone || !firstName || !lastName) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, "Username, email and password are required")
      );
  }

  const validatedEmail = validateAndTrimEmail(email);
  console.log(validatedEmail);

  let user = await User.findOne({ where: { username } });
  if (user) {
    return res
      .status(409)
      .json(new ApiResponse(409, null, "username already exists"));
  }

  user = await User.findOne({ where: { email: validatedEmail } });

  if (user) {
    return res
      .status(409)
      .json(new ApiResponse(409, null, "email already exists"));
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create(
    {
      username,
      email,
      password: passwordHash,
      firstName,
      lastName,
      phone, address, city, state,
      role,
    },
    {
      fields: [
        "username",
        "email",
        "password",
        "firstName",
        "lastName",
        "role",
      ],
    }
  );

  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "User Created Successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  console.log("Login User Controller");
  const { email, password } = req.body;

  const validatedEmail = validateAndTrimEmail(email);

  console.log(email, password);

  if (email && !validatedEmail) {
    res.status(400).json(new ApiResponse(400, null, "Invalid email format"));
    throw new ApiError(400, "Invalid email format");
  }

  if (!validatedEmail || !password) {
    res
      .status(400)
      .json(new ApiResponse(400, null, "Email and Password are required"));
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({
    where: { email: validatedEmail },
      exclude: ["password"],
    });

  if (!user) {
    res.status(401).json(new ApiResponse(401, null, "user Not Found"));
    throw new ApiError(401, "user Not Found");
  }

  if (!(await bcrypt.compare(password, user.password))) {
    res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid email or password"));
    throw new ApiError(401, "Invalid email or password");
  }

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

export const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, address, city, state } = req.body;

  const user = await User.findByPk(req.user.user_id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) {
    res.status(404).json(new ApiResponse(404, null, "User Not Found"));
    throw new ApiError(404, "User Not Found");
  }

  if(!firstName || !lastName || !phone || !address || !city || !state){
    return res.status(400).json(new ApiResponse(400, null, "All fields are required"));
  }

  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.phone = phone || user.phone;
  user.address = address || user.address;
  user.city = city || user.city;
  user.state = state || user.state;

  await user.save();

  res.status(200).json(new ApiResponse(200, user, "User Updated Successfully"));
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.user_id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) {
    res.status(404).json(new ApiResponse(404, null, "User Not Found"));
    throw new ApiError(404, "User Not Found");
  }

  if (!(await bcrypt.compare(oldPassword, user.password))) {
    res.status(401).json(new ApiResponse(401, null, "Invalid Password"));
    throw new ApiError(401, "Invalid Password");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, user, "Password Updated Successfully"));
});

export const updateToken = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.user_id, {
    attributes: { exclude: ["password"] },
  });

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
  // const user = await User.findByPk(req.user.user_id).select("-password");

  return res.status(200).json(new ApiResponse(200, req.user, "User Profile"));
});
