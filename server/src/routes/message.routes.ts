import { Router } from "express";
import arcjetProtection from "../middleware/aj.js";
import { verifyJWT } from "../middleware/auth.js";
import {
  deleteMessage,
  getAllContacts,
  getChatMessage,
  getChats,
  sendMessage,
} from "../controllers/message.controller.js";
import { upload } from "../middleware/multer.js";

const messageRoute = Router();

messageRoute.use(arcjetProtection);
messageRoute.get("/get-contacts", verifyJWT, getAllContacts);
messageRoute.get("/get-chat-messages{/:receiverId}", verifyJWT, getChatMessage);
messageRoute.get("/get-chats", verifyJWT, getChats);
messageRoute.post(
  "/send-message{/:receiverId}",
  verifyJWT,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  sendMessage,
);
messageRoute.delete("/delete-message{/:messageId}", verifyJWT, deleteMessage);

export default messageRoute;
