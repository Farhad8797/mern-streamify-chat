import type { CookieOptions } from "express";

const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";

const options: CookieOptions = {
  secure: process.env.NODE_END === "production" ? true : false,
  httpOnly: true,
  path: "/",
};

export { frontendURL, options };
