import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import type { ExtendedError } from "socket.io";
import type { CustomJwtPayload } from "./auth.js";
import User, { type UserInterface } from "../models/user.model.js";
import { Types } from "mongoose";
import { type Cookies } from "cookie";
import * as cookie from "cookie";

declare module "socket.io" {
  interface Socket {
    user?: UserInterface;
    _id: Types.ObjectId;
  }
}

export default async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void,
) {
  console.log("1. Testing middleware execution...");

  try {
    const cookieHeader = socket.handshake.headers.cookie;
    const cookies: Cookies = cookie.parseCookie(cookieHeader as string);
    const accessToken = cookies.accessToken;
    console.log(
      "2. Token received from client:",
      accessToken ? "Present (Hidden)" : "MISSING!",
    );

    if (!accessToken) {
      console.log(" Exiting: Token is missing");
      return next(new Error("Authentication error: Token missing"));
    }

    console.log("3. Verifying JWT...");
    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string,
    ) as CustomJwtPayload;
    console.log("4. JWT verified successfully for ID:", decodedToken._id);

    console.log("5.  querying Database for user...");
    const user = await User.findById(decodedToken._id);
    console.log("6. User query result:", user ? user.email : "NOT FOUND");

    if (!user || !user.isVerified) {
      console.log(" Exiting: User not found or not verified");
      return next(
        new Error("Error: Verified user not found matching this _id."),
      );
    }

    socket.user = user;
    socket._id = user._id;
    console.log("middleware passed!");
    next();
  } catch (err: any) {
    console.log("CATCH BLOCK TRIGGERED:", err.message);
    next(new Error("Failed to authenticate the User."));
  }
}
