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
  resetPassword,
  verifyPasswordRecoveryEmail,
  updatePassword,
} from "../controllers/user.controller.js";
import arcjetProtection from "../middleware/aj.js";

const userRoute = Router();

userRoute.use(arcjetProtection);

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
userRoute.get("/verify-email", verifySignUpEmail);
userRoute.post("/sign-in", redirectIfAuthenticated, signIn);
userRoute.post("/sign-out", verifyJWT, signOut);
userRoute.patch(
  "/update-user-info",
  verifyJWT,
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
  updateUserInfo,
);
userRoute.post("/refresh-token", refreshToken);
userRoute.get("/verify-email-change", verifyNewEmail);
userRoute.post("/reset-password", resetPassword);
userRoute.get("/verify-password-change", verifyPasswordRecoveryEmail);
userRoute.post("/update-password", updatePassword);

export default userRoute;
