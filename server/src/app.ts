import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { type Express } from "express";
import type { Request, Response } from "express";
import apiResponse from "./utils/apiResponse.js";

const app: Express = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8000",
  "http://localhost:3000",
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

import userRoute from "./routes/userRoutes.js";

const header = "/api/v1";

app.use(`${header}`, userRoute);
app.use("/*splat", (req: Request, res: Response) => {
  return res.status(404).json(
    apiResponse({
      statusCode: 404,
      message: `Page ${req.originalUrl} Not Found!`,
      success: false,
    }),
  );
});

export default app;
