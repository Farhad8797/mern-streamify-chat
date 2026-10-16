import { Router } from "express";
import { redirectIfAuthenticated, verifyJWT } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";

import {
  registerUser,
  signIn,
  verifySignUpEmail,
  signOut,
  updateUserInfo,
  refreshToken,
  verifyNewEmail,
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

userRoute.get("/verify-email/", verifySignUpEmail);
userRoute.post("/sign-in/", redirectIfAuthenticated, signIn);
userRoute.post("/sign-out", verifyJWT, signOut);
userRoute.patch("/update-user-info", verifyJWT, updateUserInfo);
userRoute.post("/refresh-token", refreshToken);
userRoute.get("/verify-email-change", verifyNewEmail);

export default userRoute;
