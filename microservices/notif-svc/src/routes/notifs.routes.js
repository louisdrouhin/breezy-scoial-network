import { Router } from "express"

import internal from "../middlewares/internal.js";
import { getNotifs, markAsRead, markAllAsRead, createNotif } from "../controllers/notifs.controller.js";


const router = Router();

router.get("/", getNotifs);
router.patch('/:id/read', markAsRead)
router.patch('/read-all', markAllAsRead);
router.post("/", internal, createNotif);

export default router;