import express from "express";
import { extractUser, requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { uploadImage } from "../middlewares/upload.middleware.js";
import * as usersController from "../controllers/users.controller.js";


import {
  GetPublicProfileSchema,
  UpdateProfileSchema,
  FollowParamsSchema,
} from "../schemas/users.schema.js";

const router = express.Router();

// Appliquer extractUser à toutes les routes
router.use(extractUser);

// Route de recherche — AVANT /:username pour éviter le conflit
router.get("/search", usersController.searchUsers);

// Protected routes (besoin de requireAuth) - AVANT les routes avec :username
router.get("/me", requireAuth, usersController.getMyProfile);
router.patch(
  "/me",
  requireAuth,
  validate(UpdateProfileSchema, "body"),
  usersController.updateMyProfile,
);

// Upload avatar / bannière (multipart, champ "file"). requireAuth AVANT multer
// pour que req.user.username soit dispo au nommage du fichier.
router.post("/me/avatar", requireAuth, uploadImage, usersController.uploadAvatar);
router.post("/me/banner", requireAuth, uploadImage, usersController.uploadBanner);

// Public routes (pas besoin de requireAuth)
router.get(
  "/:username",
  validate(GetPublicProfileSchema, "params"),
  usersController.getPublicProfile,
);
router.get(
  "/:username/followers",
  validate(GetPublicProfileSchema, "params"),
  usersController.getFollowers,
);
router.get(
  "/:username/following",
  validate(GetPublicProfileSchema, "params"),
  usersController.getFollowing,
);
router.post(
  "/:username/follow",
  requireAuth,
  validate(FollowParamsSchema, "params"),
  usersController.followUser,
);
router.delete(
  "/:username/follow",
  requireAuth,
  validate(FollowParamsSchema, "params"),
  usersController.unfollowUser,
);

export default router;
