import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";

import {
  registerUser,
  signIn,
  verifyEmail,
  signOut,
} from "../controllers/user.controller.js";

const userRoute = Router();

userRoute.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

userRoute.get("/verify-email/", verifyEmail);
userRoute.post("/sign-in/", signIn);
userRoute.post("/sign-out", verifyJWT, signOut);

export default userRoute;
