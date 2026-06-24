import { Router } from "express"

import internal from "../middlewares/internal.js";
import { getNotifs, markAsRead, markAllAsRead, deleteNotif, createNotif } from "../controllers/notifs.controller.js";


const router = Router();

router.get("/", getNotifs);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotif);
router.post("/", internal, createNotif);

export default router;