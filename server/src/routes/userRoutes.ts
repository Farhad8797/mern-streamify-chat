import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";

import { registerUser } from "../controllers/user.controller.js";

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

export default userRoute;
