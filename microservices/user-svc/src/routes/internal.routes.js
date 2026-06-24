import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import * as usersController from "../controllers/users.controller.js";

import { CreateProfileSchema } from "../schemas/users.schema.js";

const router = express.Router();

// Internal routes (service-to-service only)
router.post(
  "/create",
  validate(CreateProfileSchema, "body"),
  usersController.createProfile,
);

router.get("/:username/notif-prefs", usersController.getNotifPrefs);

export default router;
