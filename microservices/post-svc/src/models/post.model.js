import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    authorUsername: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 280, // Fx3
    },
    tags: {
      type: [String], // Fx12 / Fx13
      default: [],
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "posts",
  },
);

export default model("Post", postSchema);
