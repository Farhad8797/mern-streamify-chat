import mongoose, { Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface UserInterface {
  email: string;
  fullName: string;
  avatarFile: {
    avatarUrl: string;
    avatarId: string;
  };
  coverImageFile: {
    coverImageUrl: string;
    coverImageId: string;
  };
  password: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  emailVerificationToken: string;
  emailVerificationExpiry: Date;
}

interface UserMethods {
  isPasswordCorrect(name: string): Promise<any>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const UserSchema = new Schema<
  UserInterface,
  Model<UserInterface, {}, UserMethods>,
  UserMethods
>(
  {
    fullName: {
      type: String,
      required: true,
      index: true,
      trim: true,
      match: [
        /^[a-zA-Z]+([a-zA-Z\s.]*[a-zA-Z])?$/,
        "Full name contains invalid characters or numbers.",
      ],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email.",
      ],
    },

    avatarFile: {
      avatarUrl: String,
      avatarId: String,
    },

    coverImageFile: {
      coverImageUrl: String,
      coverImageId: String,
    },

    password: {
      type: String,
      required: [true, "Password is mandatory"],
      min: [6, "Password must contain at least 6 characters"],
      max: [15, "Password should not exceed 15 characters"],
      select: false,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpiry: Date,
  },
  { timestamps: true },
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.method(
  "isPasswordCorrect",
  async function isPasswordCorrect(password: string) {
    return await bcrypt.compare(password, this.password);
  },
);

UserSchema.method("generateAccessToken", function generateAccessToken() {
  return jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: "30m",
    },
  );
});

UserSchema.method("generateRefreshToken", function generateRefreshToken() {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "15d",
    },
  );
});

const User =
  (mongoose.models.User as mongoose.Model<UserInterface, {}, UserMethods>) ||
  mongoose.model<UserInterface, UserMethods>("User", UserSchema);

export default User;
