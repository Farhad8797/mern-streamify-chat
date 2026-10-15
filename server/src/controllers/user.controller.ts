import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import clearTemp from "../utils/clearTemp.js";
import apiResponse from "../utils/apiResponse.js";
import uploadFile from "../config/imagekit.js";

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

  const existingUser = await User.findOne({ fullName });

  if (existingUser) {
    clearTemp();
    return res.status(409).json(
      apiResponse({
        statusCode: 409,
        message: "User already exists.",
        success: false,
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
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  return res.status(201).json(
    apiResponse({
      statusCode: 201,
      message: "User Created Successfully",
      data: createdUser,
    }),
  );
});

export { registerUser };
