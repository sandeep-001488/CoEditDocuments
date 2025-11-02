import { validationResult } from "express-validator";
import { register, login, getMe } from "../services/authService.js";

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
};

export const registerController = async (req, res) => {
  if (!handleValidation(req, res)) return;
  const data = await register(req.body.name, req.body.email, req.body.password);
  res.status(201).json(data);
};

export const loginController = async (req, res) => {
  if (!handleValidation(req, res)) return;
  const data = await login(req.body.email, req.body.password);
  res.status(200).json(data);
};

export const getMeController = async (req, res) => {
  const user = await getMe(req.user.id);
  res.status(200).json(user);
};

export const logoutController = async (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out successfully" });
};
