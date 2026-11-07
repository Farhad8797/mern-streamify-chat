import { Server } from "socket.io";
import http from "http";
import type { Express } from "express";
import express from "express";
import socketAuthMiddleware from "./middleware/socket.auth.js";
import cookieParser from "cookie-parser";
import type { Request, Response } from "express";
import apiResponse from "./utils/apiResponse.js";
import cors from "cors";

const app: Express = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8000",
  "http://localhost:3000",
  process.env.CORS_ORIGIN,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS"));
      }
    },
    credentials: true,
  },
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by Express CORS"));
      }
    },
    credentials: true,
  }),
);
io.use(socketAuthMiddleware);

app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

import userRoute from "./routes/user.routes.js";
import messageRoute from "./routes/message.routes.js";

const header = "/api/v1";

app.use(`${header}`, userRoute);
app.use(`${header}`, messageRoute);
app.use("/*splat", (req: Request, res: Response) => {
  return res.status(404).json(
    apiResponse({
      statusCode: 404,
      message: `Page ${req.originalUrl} Not Found!`,
      success: false,
    }),
  );
});

const userSocketObj: Record<string, string> = {};

io.on("connection", (socket) => {
  console.log("Socket connected: ", socket.user?.fullName);

  const userId =
    socket._id?.toString() || (socket.handshake.query.userId as string);

  if (userId) {
    userSocketObj[userId] = socket.id;
  }

  console.log("Current Online Users Map:", userSocketObj);

  io.emit("getOnlineUsers", Object.keys(userSocketObj));

  socket.on("disconnect", () => {
    console.log("Socket disconnected: ", socket.user?.fullName);
    if (userId) {
      delete userSocketObj[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketObj));
    console.log("Current Online Users Map after disconnect:", userSocketObj);
  });
});

export { server, app, userSocketObj, io };
