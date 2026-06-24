import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    authorUsername: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      // Optionnel : un post peut n'être qu'un média (validation « contenu OU
      // média requis » faite dans le controller). maxlength conservé (Fx3).
      default: "",
      maxlength: 280,
    },
    // Médias optionnels (images / GIF). Cap applicatif à 1 (cf. controller).
    media: {
      type: [
        {
          _id: false,
          url: { type: String, required: true },
          type: { type: String, enum: ["image", "gif"], default: "image" },
        },
      ],
      default: [],
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
    edited: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "posts",
  },
);

export default model("Post", postSchema);
