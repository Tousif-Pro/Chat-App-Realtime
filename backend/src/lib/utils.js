// lib/utils.js
import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV === "production", // cookie will only be sent in HTTPS
    path: "/" // cookie available for all routes
  });

  return token;
};