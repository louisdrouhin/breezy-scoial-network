import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    recipientUsername: {
      type: String,
      required: true,
    },
    actorUsername: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["MENTION", "LIKE", "NEW_FOLLOWER", "COMMENT"],
      required: true,
    },
    relatedPostId: {
      type: String,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    collection: "notifications",
  },
);

export default model("Notification", notificationSchema);
