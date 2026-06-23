import { Router } from "express";
import * as postsController from "../controllers/posts.controller.js";
import internal from "../middlewares/internal.js";

const router = Router();

// Order is important: specific static routes first to avoid matching :id params
router.post("/", postsController.createPost);
router.get("/by-authors", internal, postsController.getPostsByAuthors);
router.get("/user/:username", postsController.getUserPosts);
router.get("/tags/:tag", postsController.getPostsByTag);

router.get("/:id", postsController.getPost);
router.get("/:id/replies", postsController.getReplies);
router.delete("/:id", postsController.deletePost);

router.post("/:id/like", postsController.likePost);
router.delete("/:id/like", postsController.unlikePost);

export default router;
