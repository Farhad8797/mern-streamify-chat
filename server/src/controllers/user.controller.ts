import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import clearTemp from "../utils/clearTemp.js";
import apiResponse from "../utils/apiResponse.js";
import uploadFile from "../config/imagekit.js";
import crypto from "crypto";
import sendEmail from "../config/resend.js";
import generateTokenPair from "../utils/generateTokenPair.js";
import type { CookieOptions } from "express";

const frontendURL = process.env.FRONTEND_URL || "http://localhost:8000";

const options: CookieOptions = {
  secure: process.env.NODE_END === "production" ? true : false,
  httpOnly: true,
  path: "/",
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  if (
    [fullName, email, password].some(
      (element) => !element || element?.trim() === "",
    )
  ) {
    clearTemp();
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "Credentials were not provided",
        success: false,
      }),
    );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.isVerified) {
      clearTemp();
      return res.status(409).json(
        apiResponse({
          statusCode: 409,
          message: "User already exists.",
          success: false,
        }),
      );
    }
    const files =
      req.files && !Array.isArray(req.files) ? req.files : undefined;
    const avatarLocalPath = files?.avatar?.[0]?.path;
    const coverImageLocalPath = files?.coverImage?.[0]?.path;

    const avatar = avatarLocalPath
      ? await uploadFile(avatarLocalPath as string, "avatar")
      : undefined;
    const coverImage = coverImageLocalPath
      ? await uploadFile(coverImageLocalPath as string, "coverImage")
      : undefined;
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    existingUser.fullName = fullName;
    existingUser.password = password;
    existingUser.avatarFile.avatarId = (avatar?.fileId as string) ?? "";
    existingUser.avatarFile.avatarUrl = (avatar?.url as string) ?? "";
    existingUser.coverImageFile.coverImageId =
      (coverImage?.fileId as string) ?? "";
    existingUser.coverImageFile.coverImageUrl =
      (coverImage?.url as string) ?? "";
    existingUser.emailVerificationExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );
    existingUser.emailVerificationToken = emailVerificationToken;

    const emailVerificationURL = `${frontendURL}/api/v1/verify-email/?token=${emailVerificationToken}`;

    await existingUser.save({ validateBeforeSave: false });
    await sendEmail(fullName, emailVerificationURL);
    clearTemp();
    return res.status(200).json(
      apiResponse({
        statusCode: 200,
        message:
          "Seems you signed up once but did not verify, you are provided with a new verification url with token",
        data: existingUser,
      }),
    );
  }

  const files = req.files && !Array.isArray(req.files) ? req.files : undefined;
  const avatarLocalPath = files?.avatar?.[0]?.path;
  const coverImageLocalPath = files?.coverImage?.[0]?.path;

  const avatar = avatarLocalPath
    ? await uploadFile(avatarLocalPath as string, "avatar")
    : undefined;
  const coverImage = coverImageLocalPath
    ? await uploadFile(coverImageLocalPath as string, "coverImage")
    : undefined;

  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await User.create({
    email,
    fullName,
    password,
    avatarFile: {
      avatarUrl: (avatar?.url as string) ?? "",
      avatarId: (avatar?.fileId as string) ?? "",
    },
    coverImageFile: {
      coverImageUrl: (coverImage?.url as string) ?? "",
      coverImageId: (coverImage?.fileId as string) ?? "",
    },
    emailVerificationExpiry,
    emailVerificationToken,
  });

  clearTemp();

  const emailVerificationURL = `${frontendURL}/api/v1/verify-email/?token=${emailVerificationToken}`;
  await sendEmail(fullName, emailVerificationURL);

  const createdUser = await User.findById(user._id);
  return res.status(201).json(
    apiResponse({
      statusCode: 201,
      message: "User created successfully!",
      data: createdUser,
    }),
  );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "Missing token",
        success: false,
      }),
    );
  }

  const user = await User.findOne({
    emailVerificationToken: token as string,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "User not found",
        success: false,
      }),
    );
  }

  await User.findByIdAndUpdate(
    user._id,
    {
      $set: { isVerified: true },
      $unset: { emailVerificationExpiry: 1, emailVerificationToken: 1 },
    },
    { runValidators: true, new: true },
  );

  return res.redirect(`${process.env.FRONTEND_URL}/sign-in?verified=true`);
});

const signIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "Email or username must be provided",
        success: false,
      }),
    );
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "User is not registered",
        success: false,
      }),
    );
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    return res.status(401).json(
      apiResponse({
        statusCode: 401,
        message: "Incorrect password",
        success: false,
      }),
    );
  }

  const { accessToken, refreshToken } = await generateTokenPair(
    user._id.toString(),
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, { ...options, maxAge: 30 * 60 * 1000 })
    .cookie("refreshToken", refreshToken, {
      ...options,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    })
    .json(
      apiResponse({
        statusCode: 200,
        message: "user logged in successfully",
      }),
    );
});

const signOut = asyncHandler(async (req, res) => {
  const user = req.user;
  await User.findByIdAndUpdate(
    user._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
      apiResponse({
        statusCode: 200,
        message: "Successfully logged out user",
      }),
    );
});

export { registerUser, verifyEmail, signIn, signOut };
