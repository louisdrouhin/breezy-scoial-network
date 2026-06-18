import { Schema, model } from "mongoose";

const likeSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    collection: "likes",
  },
);

// Un utilisateur ne peut liker qu'une fois le même post
likeSchema.index({ username: 1, post: 1 }, { unique: true });

export default model("Like", likeSchema);
