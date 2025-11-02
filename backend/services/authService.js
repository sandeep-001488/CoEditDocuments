import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

export const register = async (name, email, password) => {
  const userExists = await User.findOne({ email });
  if (userExists) throw new Error("User already exists");

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return {
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password)))
    throw new Error("Invalid credentials");

  const token = generateToken(user._id);
  return {
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return {
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };
};
