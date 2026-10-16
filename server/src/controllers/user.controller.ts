import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import clearTemp from "../utils/clearTemp.js";
import apiResponse from "../utils/apiResponse.js";
import crypto from "crypto";
import generateTokenPair from "../utils/generateTokenPair.js";
import type { CookieOptions } from "express";
import type { CustomJwtPayload } from "../middleware/auth.js";
import jwt from "jsonwebtoken";
import client from "../config/imagekit.js";
import uploadFile from "../utils/mediaUpload.js";
import signUpEmail from "../utils/signUpEmail.js";
import redis from "../config/redis.js";
import {
  sendEmailChangeAlert,
  sendEmailChangeVerification,
  sendProfileUpdateNotification,
} from "../utils/accountUpdateEmail.js";

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
    await signUpEmail(fullName, emailVerificationURL);
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
  await signUpEmail(fullName, emailVerificationURL);

  const createdUser = await User.findById(user._id);
  return res.status(201).json(
    apiResponse({
      statusCode: 201,
      message: "User created successfully!",
      data: createdUser,
    }),
  );
});

const verifySignUpEmail = asyncHandler(async (req, res) => {
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
    .clearCookie("accessToken", { ...options, maxAge: 30 * 60 * 1000 })
    .clearCookie("refreshToken", {
      ...options,
      maxAge: 15 * 24 * 68 * 68 * 1000,
    })
    .json(
      apiResponse({
        statusCode: 200,
        message: "Successfully logged out user",
      }),
    );
});

const updateUserInfo = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  const files = req.files && !Array.isArray(req.files) ? req.files : undefined;

  const avatarLocalPath = files?.avatar?.[0]?.path;
  const coverImageLocalPath = files?.coverImage?.[0]?.path;

  const avatar = avatarLocalPath
    ? await uploadFile(avatarLocalPath as string, "avatar")
    : undefined;
  const coverImage = coverImageLocalPath
    ? await uploadFile(coverImageLocalPath as string, "coverImage")
    : undefined;

  const user = await User.findById(req.user._id);

  const mediaFilesToBeDeleted = [
    avatar?.fileId ? user!.avatarFile.avatarId : null,
    coverImage?.fileId ? user!.coverImageFile.coverImageId : null,
  ].filter(Boolean) as string[];

  if (mediaFilesToBeDeleted.length > 0) {
    await client.files.bulk.delete({ fileIds: mediaFilesToBeDeleted });
  }

  user!.fullName = fullname || user!.fullName;
  user!.avatarFile.avatarUrl = avatar?.url || user!.avatarFile.avatarUrl;
  user!.avatarFile.avatarId = avatar?.fileId || user!.avatarFile.avatarId;
  user!.coverImageFile.coverImageId =
    coverImage?.fileId || user!.coverImageFile.coverImageId;
  user!.coverImageFile.coverImageUrl =
    coverImage?.url || user!.coverImageFile.coverImageUrl;

  let emailChangePending = false;

  if (email && email !== user!.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(
        apiResponse({
          statusCode: 400,
          message: "Email is already in use",
          success: false,
        }),
      );
    }

    const emailToken = crypto.randomBytes(32).toString("hex");
    const redisKey = `email-change:${emailToken}`;

    await redis.setex(
      redisKey,
      900,
      JSON.stringify({ userId: user!._id, newEmail: email }),
    );

    await Promise.all([
      sendEmailChangeVerification(email, emailToken),
      sendEmailChangeAlert(user!.email),
    ]);

    emailChangePending = true;
  }

  await user!.save();
  sendProfileUpdateNotification(user!.email);
  clearTemp();

  return res.status(200).json(
    apiResponse({
      statusCode: 200,
      message: emailChangePending
        ? "User info updated. Please check your new email inbox to verify your email change."
        : "User info updated successfully",
      data: {
        emailChangePending,
      },
    }),
  );
});

const refreshToken = asyncHandler(async (req, res) => {
  const servedRefreshToken = req.cookies?.refreshToken;

  if (!servedRefreshToken) {
    res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "Please provide refresh token",
        success: false,
      }),
    );
  }

  const isValidToken = jwt.verify(
    servedRefreshToken,
    process.env.REFRESH_TOKEN_SECRET as string,
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

  if (!user) {
    return res.status(401).json(
      apiResponse({
        statusCode: 401,
        message: "Unauthorized",
        success: false,
      }),
    );
  }

  if (!user.refreshToken) {
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "User does not contain any refresh token inside database",
        success: false,
      }),
    );
  }

  const matchRefereshTokens = user.refreshToken === servedRefreshToken;

  if (!matchRefereshTokens) {
    return res.status(401).json(
      apiResponse({
        statusCode: 400,
        message: "Refresh tokens does not match with the stored token",
        success: false,
      }),
    );
  }

  const { accessToken, refreshToken } = await generateTokenPair(
    user._id.toString(),
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, { ...options, maxAge: 30 * 68 * 1000 })
    .cookie("refreshToken", refreshToken, {
      ...options,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    })
    .json(
      apiResponse({
        statusCode: 200,
        message: "New refresh token generated successfully!",
        data: { refreshToken },
      }),
    );
});

const verifyNewEmail = asyncHandler(async (req, res) => {
  const token = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "Email change verification token is missing or invalid",
        success: false,
      }),
    );
  }

  const redisKey = `email-change:${token}`;
  const tokenDataString = await redis.get(redisKey);

  if (!tokenDataString) {
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message:
          "Email change link is invalid or has expired (15-minute limit)",
        success: false,
      }),
    );
  }

  const { userId, newEmail } = JSON.parse(tokenDataString as string);
  const emailTaken = await User.findOne({ email: newEmail });

  if (emailTaken) {
    await redis.del(redisKey);
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "This email address is already registered to another account",
        success: false,
      }),
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    await redis.del(redisKey);
    return res.status(404).json(
      apiResponse({
        statusCode: 404,
        message: "User account not found",
        success: false,
      }),
    );
  }

  user.email = newEmail;
  await user.save();

  await redis.del(redisKey);

  return res.status(200).json(
    apiResponse({
      statusCode: 200,
      message: "Email address updated successfully!",
      success: true,
    }),
  );
});

const recoverPassword = asyncHandler(async (req, res) => {});

export {
  registerUser,
  verifySignUpEmail,
  signIn,
  signOut,
  updateUserInfo,
  refreshToken,
  verifyNewEmail,
};
