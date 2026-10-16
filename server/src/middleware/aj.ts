import aj from "../config/arcjet.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { isSpoofedBot } from "@arcjet/inspect";

const arcjetProtection = asyncHandler(async (req, res, next) => {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return res.status(429).json(
        apiResponse({
          statusCode: 429,
          success: false,
          message: "Maxium number of attempts reached, please try again later",
        }),
      );
    } else if (decision.reason.isBot()) {
      return res.status(403).json(
        apiResponse({
          statusCode: 403,
          success: false,
          message: "Maxium number of attempts reached, please try again later",
        }),
      );
    } else {
      return res.status(400).json(
        apiResponse({
          statusCode: 400,
          success: false,
          message: "Arcjet internal issue.",
        }),
      );
    }
  }
  if (decision.results.some(isSpoofedBot)) {
    return res.status(403).json(
      apiResponse({
        statusCode: 403,
        success: false,
        message: "Spoofed Bot detected!",
      }),
    );
  }

  next();
});

export default arcjetProtection;
