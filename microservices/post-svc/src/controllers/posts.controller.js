import Post from "../models/post.model.js";
import Like from "../models/like.model.js";
import mongoose from "mongoose";

const notifSvcUrl = process.env.NOTIF_SVC_URL || "http://notif-svc:3004";
const internalSecret = process.env.INTERNAL_SECRET || process.env.INTERNAL_API_KEY || "test-key-123";

// Helper to trigger notifications via notif-svc
async function triggerNotification(type, recipientUsername, actorUsername, relatedPostId) {
  if (recipientUsername === actorUsername) return; // Don't notify oneself
  try {
    const response = await fetch(`${notifSvcUrl}/api/notifs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": internalSecret,
      },
      body: JSON.stringify({
        type,
        recipientUsername,
        actorUsername,
        relatedPostId,
      }),
    });
    if (!response.ok) {
      console.error(`Failed to trigger notification. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error triggering notification:", error);
  }
}

// 1. Create a Post or Comment
export const createPost = async (req, res, next) => {
  try {
    const authorUsername = req.get("x-user-username");
    if (!authorUsername) {
      return res.status(400).json({ message: "Missing user header" });
    }

    const { content, parentId } = req.body;
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" });
    }

    if (content.length > 280) {
      return res.status(400).json({ message: "Content cannot exceed 280 characters" });
    }

    // Process tags (merge from body and extract from hashtags in content)
    let resolvedTags = Array.isArray(req.body.tags) ? req.body.tags.map(t => t.toLowerCase()) : [];
    const hashtagRegex = /#(\w+)/g;
    let match;
    while ((match = hashtagRegex.exec(content)) !== null) {
      const tag = match[1].toLowerCase();
      if (!resolvedTags.includes(tag)) {
        resolvedTags.push(tag);
      }
    }

    // Handle replies (comments)
    let parentPost = null;
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: "Invalid parent ID format" });
      }
      parentPost = await Post.findById(parentId);
      if (!parentPost) {
        return res.status(404).json({ message: "Parent post not found" });
      }
    }

    // Create the post
    const post = await Post.create({
      authorUsername,
      content,
      tags: resolvedTags,
      parent: parentId || null,
    });

    // If it's a comment, increment parent's replyCount and trigger notification
    if (parentPost) {
      await Post.findByIdAndUpdate(parentId, { $inc: { replyCount: 1 } });
      
      // Trigger comment notification
      await triggerNotification(
        "COMMENT",
        parentPost.authorUsername,
        authorUsername,
        post._id
      );
    }

    // Process mentions (e.g. @alice)
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    while ((match = mentionRegex.exec(content)) !== null) {
      const username = match[1];
      if (username !== authorUsername && !mentions.includes(username)) {
        mentions.push(username);
      }
    }

    // Trigger mention notifications
    for (const username of mentions) {
      await triggerNotification("MENTION", username, authorUsername, post._id);
    }

    return res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

// 2. Get Post by ID
export const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json(post);
  } catch (error) {
    next(error);
  }
};

// 3. Get Replies to a Post (Paginated)
export const getReplies = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const replies = await Post.find({ parent: id })
      .sort({ created_at: 1 }) // Chronological order
      .skip(skip)
      .limit(limit);

    return res.json(replies);
  } catch (error) {
    next(error);
  }
};

// 4. Get Posts by Username (Paginated)
export const getUserPosts = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ authorUsername: username })
      .sort({ created_at: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    return res.json(posts);
  } catch (error) {
    next(error);
  }
};

// 5. Delete a Post
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    const username = req.get("x-user-username");
    const role = req.get("x-user-role");
    if (!username) {
      return res.status(400).json({ message: "Missing user header" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Authorization check: only author or mod/admin can delete
    if (post.authorUsername !== username && role !== "admin" && role !== "mod") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Post.findByIdAndDelete(id);

    // If it was a comment, decrement parent's replyCount
    if (post.parent) {
      await Post.findByIdAndUpdate(post.parent, { $inc: { replyCount: -1 } });
    }

    // Also delete any associated likes
    await Like.deleteMany({ post: id });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// 6. Like a Post
export const likePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    const username = req.get("x-user-username");
    if (!username) {
      return res.status(400).json({ message: "Missing user header" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if already liked
    const existingLike = await Like.findOne({ username, post: id });
    if (existingLike) {
      return res.json({ liked: true, count: post.likeCount });
    }

    await Like.create({ username, post: id });

    // Increment likeCount on the post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );

    // Trigger notification
    await triggerNotification(
      "LIKE",
      post.authorUsername,
      username,
      post._id
    );

    return res.json({ liked: true, count: updatedPost.likeCount });
  } catch (error) {
    next(error);
  }
};

// 7. Unlike a Post
export const unlikePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    const username = req.get("x-user-username");
    if (!username) {
      return res.status(400).json({ message: "Missing user header" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const result = await Like.deleteOne({ username, post: id });

    // If a like was actually deleted, decrement the post's likeCount
    let updatedLikeCount = post.likeCount;
    if (result.deletedCount > 0) {
      const updatedPost = await Post.findByIdAndUpdate(
        id,
        { $inc: { likeCount: -1 } },
        { new: true }
      );
      updatedLikeCount = Math.max(0, updatedPost.likeCount);
      // Clean up in case decrement drops below zero
      if (updatedPost.likeCount < 0) {
        await Post.findByIdAndUpdate(id, { likeCount: 0 });
      }
    }

    return res.json({ liked: false, count: updatedLikeCount });
  } catch (error) {
    next(error);
  }
};

// 8. Get Posts by Tag (Paginated)
export const getPostsByTag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    if (!tag) {
      return res.status(400).json({ message: "Tag is required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ tags: tag.toLowerCase() })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    return res.json(posts);
  } catch (error) {
    next(error);
  }
};

// 9. Get Posts by Authors (Internal endpoint, Paginated)
export const getPostsByAuthors = async (req, res, next) => {
  try {
    const usernamesQuery = req.query.usernames;
    if (!usernamesQuery) {
      return res.status(400).json({ message: "usernames query parameter is required" });
    }

    const usernames = usernamesQuery.split(",");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ authorUsername: { $in: usernames } })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    return res.json(posts);
  } catch (error) {
    next(error);
  }
};
