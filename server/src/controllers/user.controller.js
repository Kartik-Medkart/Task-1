import { models } from "../db/index.js";
import { Op, Sequelize } from "sequelize";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const { User, Order } = models;

const validateAndTrimEmail = (email) => {
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return null;
  }
  return trimmedEmail;
};

// const checkStrongPassword = (password) => {
//   const errors = [];

//   if (password.length < 8) {
//     errors.push("Password should be at least 8 characters long");
//   }
//   if (!/[a-z]/.test(password)) {
//     errors.push("Password should contain at least one lowercase letter");
//   }
//   if (!/[A-Z]/.test(password)) {
//     errors.push("Password should contain at least one uppercase letter");
//   }
//   if (!/\d/.test(password)) {
//     errors.push("Password should contain at least one digit");
//   }
//   if (!/[@$!%*?&]/.test(password)) {
//     errors.push("Password should contain at least one special character (@$!%*?&)");
//   }

//   return errors.length > 0 ? errors.join(",") : null;
// }

export const createUser = asyncHandler(async (req, res) => {
  console.log("Create User Controller");
  const {
    username,
    firstName,
    lastName,
    email,
    password,
    phone
  } = req.body;

  const validations = {};

  if (!username || !email || !password || !phone || !firstName || !lastName) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, [], "All Fields are required")
      );
  }

  const validatedEmail = validateAndTrimEmail(email);

  let user = await User.findOne({ where: { username } });
  if (user) {
    validations.username = "Username already exists";
  }

  user = await User.findOne({ where: { email: validatedEmail } });

  if (user) {
    validations.email = "Email already exists";
  }

  if (Object.keys(validations).length !== 0) {
    return res.status(400).json(new ApiResponse(400, validations, "Provide Valid Data"));
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let newUser;
  try {
    newUser = await User.create({
      username,
      email,
      password: passwordHash,
      firstName,
      lastName,
      phone,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "User Created Successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  console.log("Login User Controller");
  const { email, password } = req.body;
  const validations = [];

  const validatedEmail = validateAndTrimEmail(email);

  if (!validatedEmail) {
    validations["email"] += "E-Mail Required";
  }

  if(!password) {
    validations["password"] += "Password Required";
  }

  if (email && !validatedEmail) {
    validations["email"] += "Invalid Email Format";
  }

  if (validations.length > 0) {
    return res.status(400).json(new ApiResponse(400, validations, "Please Provide Valid Email and Password"));
  }

  let user = await User.findOne({
    where: { email: validatedEmail },
  });

  if (!user) {
    res.status(401).json(new ApiResponse(401, null, "user Not Found"));
    throw new ApiError(401, "user Not Found");
  }

  if (!(await bcrypt.compare(password, user?.password))) {
    res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid email or password"));
    throw new ApiError(401, "Invalid email or password");
  }

  user = user.toJSON();
  user.password = undefined;

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

  if (!firstName || !lastName || !phone || !address || !city || !state) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "All fields are required"));
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

// export const updateToken = asyncHandler(async (req, res) => {
//   const user = await User.findByPk(req.user.user_id, {
//     attributes: { exclude: ["password"] },
//   });

//   const token = jwt.sign(
//     { id: user.user_id, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: "1d" }
//   );

//   res
//     .status(200)
//     .setCookie("token", token, {
//       httpOnly: true,
//       sameSite: "None",
//       secure: true,
//     })
//     .json(new ApiResponse(200, { token, user }, "Token Updated Successfully"));
// });

export const getUserProfile = asyncHandler(async (req, res) => {
  // const user = await User.findByPk(req.user.user_id).select("-password");

  return res.status(200).json(new ApiResponse(200, req.user, "User Profile"));
});

export const searchUsers = asyncHandler(async (req, res) => {
  try {
    const { name, role, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (name) {
      where.firstName = { [Op.like]: `%${name}%` };
    }
    if (role) {
      where.role = role;
    }

    // User is not Super admin then we need to show only customers
    if (req.user.role !== "superadmin") {
      where.role = "customer";
    }

    let { rows: users, count: totalItems } = await User.findAndCountAll({
      where,
      attributes: [
        "user_id",
        "username",
        "firstName",
        "lastName",
        "email",
        "phone",
        "role",
      ],
      limit,
      offset
    });

    users = users.map((user) => user.toJSON());

    const usersWithOrderCount = await Promise.all(
      users.map(async (user) => {
        const { count } = await Order.findAndCountAll({
          where: { user_id: user.user_id },
        });
        user.orderCount = count;
        return user;
      })
    );

    console.log(usersWithOrderCount);

    const totalPages = Math.ceil(totalItems / limit);
    res.status(200).json(
      new ApiResponse(
        200,
        {
          users:usersWithOrderCount,
          totalItems,
          totalPages,
          currentPage: page,
        },
        "Products Retrieved Successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching users: ", error);
    res
      .status(500)
      .json(new ApiResponse(500, null, "Error While Fetching Users"));
  }
});

export const updateUserRole = asyncHandler(async (req, res) => {
  try {
    const {id} = req.params;
    const { role } = req.body;
  
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User Not Found"));
    }
    
    if (req.user.user_id === user.user_id) {
      return res.status(403).json(new ApiResponse(403, null, "You are not allowed to update your role"));
    }

    user.role = role;
    await user.save();
  
    return res.status(200).json(new ApiResponse(200, null, "User Role Updated Successfully"));
  } catch (error) {
    console.error("Error updating user role: ", error);
    return res.status(500).json(new ApiResponse(500, null, "Error Updating User Role"));
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findByPk(user_id);
    if (!user) {
      res.status(404).json(new ApiResponse(404, null, "User Not Found"));
    }

    if (req.user.user_id === user_id) {
      res.status(403).json(new ApiResponse(403, null, "You are not allowed to delete yourself"));
    }

    // Admins Should Not delete superadmins or Other Admins
    if(req.user.role === "admin" && (user.role === "superadmin" || user.role === "admin")) {
      res.status(403).json(new ApiResponse(403, null, "You are not allowed to delete this user"));
    }

    await user.destroy();
    res.status(200).json(new ApiResponse(200, null, "User Deleted Successfully"));
  } catch (error) {
    console.error("Error deleting user: ", error);
    res.status(500).json(new ApiResponse(500, null, "Error Deleting User"));
  }
});