import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import multer from 'multer'

// Répertoire de stockage des médias de posts (images, GIF). Volume Docker
// partagé avec Nginx, qui les sert sous /uploads/ (même volume que les avatars).
const UPLOADS_DIR = process.env.UPLOADS_DIR || '/uploads'
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

// Types acceptés : images + GIF uniquement. Pas de SVG (risque XSS si servi
// tel quel), pas de vidéo (hors scope, cf. CLAUDE.md §6).
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    // Nom unique : <username>-<timestamp>-<random>.<ext>. Le username vient du
    // header X-User-Username injecté par Nginx après validation du JWT.
    const ext = path.extname(file.originalname).toLowerCase()
    const rand = crypto.randomBytes(4).toString('hex')
    const username = req.get('x-user-username') || 'anon'
    cb(null, `${username}-${Date.now()}-${rand}${ext}`)
  },
})

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME.has(file.mimetype)) {
    cb(null, true)
  } else {
    const err = new Error('Type de fichier non supporté (jpeg, png, webp, gif uniquement)')
    err.status = 400
    cb(err, false)
  }
}

// Upload d'un média unique (champ "file"), cap à 10 Mo.
export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('file')
