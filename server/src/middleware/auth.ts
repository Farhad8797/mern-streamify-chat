import User from "../models/user.model.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
  _id: string;
  email: string;
  fullName: string;
}

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.split(" ")[1] ||
    req.header("Authorization")?.replace(/^Bearer\s+/i, "");

  if (!accessToken) {
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "No token found",
        success: false,
      }),
    );
  }

  const isValidToken = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET as string,
  ) as CustomJwtPayload;

  if (!isValidToken) {
    return res.status(401).json(
      apiResponse({
        statusCode: 401,
        message: "Invalid token",
        success: false,
      }),
    );
  }

  const user = await User.findById(isValidToken?._id);

  if (!user || !user.isVerified) {
    return res.status(401).json(
      apiResponse({
        statusCode: 401,
        message: "Unauthorized",
        success: false,
      }),
    );
  }

  req.user = user;
  next();
});

export const redirectIfAuthenticated = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    next();
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
    );

    if (decoded) {
      return res.status(400).json({
        success: false,
        message: "You are already logged in. Please go to the dashboard.",
      });
    }
  } catch (error: any) {
    res.clearCookie("accessToken");
    return next();
  }
});
