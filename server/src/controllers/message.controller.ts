import { Types } from "mongoose";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadFile from "../utils/mediaUpload.js";
import mongoose from "mongoose";
import client from "../config/imagekit.js";
import clearTemp from "../utils/clearTemp.js";
import { io, userSocketObj } from "../app.js";

const getAllContacts = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const contacts = await User.find({ _id: { $ne: senderId } });

  if (!contacts.length) {
    return res.status(200).json(
      apiResponse({
        statusCode: 200,
        message: "No contacts found.",
        data: contacts,
      }),
    );
  }

  return res.status(200).json(
    apiResponse({
      statusCode: 200,
      message: "Contacts retrieved successfully.",
      data: contacts,
    }),
  );
});

const getChatMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId } = req.params;

  if (!receiverId || !Types.ObjectId.isValid(receiverId as string)) {
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "Invalid or missing receiverId",
        success: false,
      }),
    );
  }
  const chatMessages = await Message.find({
    $or: [
      {
        sender: senderId,
        receiver: new mongoose.Types.ObjectId(receiverId as string),
      },
      {
        sender: new mongoose.Types.ObjectId(receiverId as string),
        receiver: senderId,
      },
    ],
  } as any);

  if (!chatMessages.length) {
    return res
      .status(200)
      .json(
        apiResponse({ statusCode: 200, message: "This chat has 0 message" }),
      );
  }

  return res.status(200).json(
    apiResponse({
      statusCode: 200,
      message: "Messages retrieved successfully.",
      data: chatMessages,
    }),
  );
});

const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId } = req.params;
  const { text } = req.body;
  const files = req.files && !Array.isArray(req.files) ? req.files : undefined;
  const audioLocalPath = files?.audio?.[0]?.path;
  const videoLocalPath = files?.video?.[0]?.path;
  const imageLocalPath = files?.image?.[0]?.path;

  if (!receiverId || !Types.ObjectId.isValid(receiverId as string)) {
    clearTemp();
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "Invalid or missing receiverId",
        success: false,
      }),
    );
  }

  const receiver = await User.findById(receiverId);

  if (!receiver) {
    clearTemp();
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "Receiver with this _id does not exist",
        success: false,
      }),
    );
  }

  const audio = audioLocalPath
    ? await uploadFile(audioLocalPath as string, "audio")
    : undefined;

  const video = videoLocalPath
    ? await uploadFile(videoLocalPath as string, "video")
    : undefined;

  const image = imageLocalPath
    ? await uploadFile(imageLocalPath as string, "image")
    : undefined;

  if ((!text || text.trim() === "") && !audio && !video && !image) {
    clearTemp();
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        success: false,
        message: "Empty or blank message is not allowed.",
      }),
    );
  }

  const activeFields = [
    { type: "text", present: Boolean(text && text.trim() !== "") },
    {
      type: "image",
      present: Boolean(image),
    },
    {
      type: "audio",
      present: Boolean(audio),
    },
    {
      type: "video",
      present: Boolean(video),
    },
  ].filter((field) => field.present);

  type message = "text" | "audio" | "video" | "image" | "mixed";
  let messageType: message = "text";

  if (activeFields.length > 1) {
    messageType = "mixed";
  } else if (activeFields.length === 1) {
    messageType = activeFields[0]?.type as message;
  }

  const createdMessage = await Message.create({
    sender: senderId,
    receiver: receiver._id,
    text: text || "",
    audio: {
      audioUrl: audio?.url || "",
      audioId: audio?.fileId || "",
    },
    image: {
      imageUrl: image?.url || "",
      imageId: image?.fileId || "",
    },
    video: {
      videoId: video?.fileId || "",
      videoUrl: video?.url || "",
    },
    messageType,
  });

  clearTemp();

  const receiverSocketId = userSocketObj[receiverId.toString()];
  console.log(receiverId, userSocketObj);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", createdMessage);
    console.log("Server emitted the event to socket id:", receiverSocketId);
  } else {
    console.log("Receiver is offline, socket ID not found in map.");
  }

  return res.status(200).json(
    apiResponse({
      statusCode: 200,
      message: "Message sent successfully.",
      data: createdMessage,
    }),
  );
});

const getChats = asyncHandler(async (req, res) => {
  const requesterId = req.user._id;

  const chatPartners = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: requesterId }, { receiver: requesterId }],
      },
    },
    {
      $project: {
        otherUserId: {
          $cond: {
            if: { $eq: ["$sender", requesterId] },
            then: "$receiver",
            else: "$sender",
          },
        },
      },
    },
    {
      $group: { _id: "$otherUserId" },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "chats",
        pipeline: [
          {
            $project: {
              _id: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$chats",
    },
  ]);

  return res.status(200).json({
    success: true,
    chatCount: chatPartners.length,
    data: chatPartners,
  });
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  if (!messageId || !Types.ObjectId.isValid(messageId as string)) {
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "Invalid or missing messageId",
        success: false,
      }),
    );
  }

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(400).json(
      apiResponse({
        statusCode: 400,
        message: "Message with this id does not exist.",
        success: false,
      }),
    );
  }

  const isRequesterTheOwner =
    req.user._id.toString() === message.sender.toString();

  if (!isRequesterTheOwner) {
    return res.status(401).json(
      apiResponse({
        statusCode: 401,
        message: "Only sender can delete can this message",
        success: false,
      }),
    );
  }

  const mediaFileIds = [
    message.image?.imageId,
    message.audio?.audioId,
    message.video?.videoId,
  ].filter((key) => Boolean(key));

  await Message.findByIdAndDelete(messageId);
  if (mediaFileIds.length > 0) {
    await client.files.bulk.delete({ fileIds: mediaFileIds as string[] });
  }

  return res.status(200).json(
    apiResponse({
      statusCode: 200,
      message: "Message deleted successfully.",
    }),
  );
});

export { sendMessage, getAllContacts, getChatMessage, getChats, deleteMessage };
