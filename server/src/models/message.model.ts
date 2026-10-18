import mongoose, { Schema, Types } from "mongoose";

export interface MessageInterface extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  text?: string;
  audio?: {
    audioUrl: string;
    audioId: string;
  };
  video?: {
    videoUrl: string;
    videoId: string;
  };
  image?: {
    imageUrl: string;
    imageId: string;
  };
  messageType: "text" | "image" | "audio" | "video" | "mixed";
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<MessageInterface>(
  {
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    audio: {
      audioId: String,
      audioUrl: String,
    },
    video: {
      videoId: String,
      videoUrl: String,
    },
    image: {
      imageUrl: String,
      imageId: String,
    },
    messageType: {
      type: String,
      required: true,
      enum: ["text", "image", "audio", "video", "mixed"],
      default: "text",
    },
  },
  { timestamps: true },
);

MessageSchema.pre("validate", async function () {
  const hasText = this.text && this.text.trim() !== "";
  const hasMedia =
    this.audio?.audioUrl || this.video?.videoUrl || this.image?.imageUrl;

  if (!hasMedia && !hasText) {
    throw new Error(
      "Message must contain at least text or media. Blank messages are not allowed.",
    );
  }
});

const Message =
  (mongoose.models.Message as mongoose.Model<MessageInterface>) ||
  mongoose.model<MessageInterface>("Message", MessageSchema);

export default Message;
