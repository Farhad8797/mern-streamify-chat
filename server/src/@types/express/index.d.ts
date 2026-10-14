import { UserInterface, UserMethods } from "../models/user.model.js";
import { HydratedDocument } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<UserInterface, UserMethods>;
    }
  }
}
