import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";

// Répertoire de stockage des fichiers uploadés (avatars, bannières).
// Monté en volume Docker partagé avec Nginx, qui les sert sous /uploads/.
// On le crée au démarrage pour éviter une erreur multer si le point de
// montage est vide.
const UPLOADS_DIR = process.env.UPLOADS_DIR || "/uploads";
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Types d'images acceptés. On reste volontairement restrictif (pas de SVG :
// risque XSS si servi tel quel).
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    // Nom unique : <username>-<timestamp>-<random>.<ext>. Le username vient
    // du header X-User-Username injecté par Nginx (via extractUser).
    const ext = path.extname(file.originalname).toLowerCase();
    const rand = crypto.randomBytes(4).toString("hex");
    const username = req.user?.username || "anon";
    cb(null, `${username}-${Date.now()}-${rand}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME.has(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error("Unsupported file type (jpeg, png, webp, gif only)");
    err.status = 400;
    cb(err, false);
  }
}

// Middleware réutilisable pour un upload d'image unique (champ "file").
export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
}).single("file");
