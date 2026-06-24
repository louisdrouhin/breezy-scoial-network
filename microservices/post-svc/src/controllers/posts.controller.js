import Post from '../models/post.model.js'
import Like from '../models/like.model.js'
import { notifyLike, notifyComment, notifyMentions } from '../services/notif.service.js'

const OBJECT_ID_RE = /^[0-9a-f]{24}$/i

const normalizeMediaItem = (item) => {
  if (!item || typeof item.url !== 'string') return null

  const rawUrl = item.url.trim()
  if (!rawUrl) return null
  return { url: rawUrl, type: item.type === 'gif' || rawUrl.toLowerCase().includes('.gif') ? 'gif' : 'image' }
}

// Normalise les médias reçus : whitelist des champs, type contraint, cap à 1.
// `undefined` signifie "ne pas modifier" côté update.
const sanitizeMedia = (media) => {
  if (media === undefined) return { media: undefined, error: null }
  if (!Array.isArray(media) || media.length === 0) return { media: [], error: null }

  const normalized = normalizeMediaItem(media[0])
  if (!normalized) return { media: [], error: 'Média invalide' }

  return { media: [normalized], error: null }
}

const isObjectId = (id) => typeof id === 'string' && OBJECT_ID_RE.test(id)

const getGifUrl = (gif, ...paths) => {
  for (const path of paths) {
    const value = path.split('.').reduce((acc, key) => acc?.[key], gif)
    if (typeof value === 'string' && value.startsWith('https://')) return value
  }
  return null
}

const normalizeGifResults = (data) => {
  const rawResults = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.items)
        ? data.items
        : []

  return rawResults
    .map((gif) => {
      const preview = getGifUrl(
        gif,
        'media_formats.tinygif.url',
        'media_formats.nanogif.url',
        'media.tinygif.url',
        'images.preview.url',
        'preview',
        'thumbnail',
        'url',
      )
      const url = getGifUrl(
        gif,
        'media_formats.gif.url',
        'media_formats.tinygif.url',
        'media.gif.url',
        'images.original.url',
        'gif.url',
        'url',
      )
      return { id: String(gif.id ?? gif.slug ?? url ?? ''), preview, url }
    })
    .filter(gif => gif.id && gif.url && gif.preview)
}

export const createPost = async (req, res) => {
  const authorUsername = req.get('x-user-username')
  if (!authorUsername) return res.status(401).json({ message: 'Non authentifié' })

  const { content, tags, parentId, media } = req.body
  const cleanContent = typeof content === 'string' ? content.trim() : ''
  const sanitized = sanitizeMedia(media)
  if (sanitized.error) return res.status(400).json({ message: sanitized.error })
  const cleanMedia = sanitized.media ?? []
  // Un post doit avoir au moins du texte OU un média.
  if (!cleanContent && cleanMedia.length === 0) {
    return res.status(400).json({ message: 'Le contenu ou un média est requis' })
  }
  if (cleanContent.length > 280) {
    return res.status(400).json({ message: 'Contenu trop long (280 caractères max)' })
  }

  let parentAuthor = null
  if (parentId) {
    if (!isObjectId(parentId)) return res.status(400).json({ message: 'Post parent invalide' })
    const parent = await Post.findById(parentId)
    if (!parent) return res.status(404).json({ message: 'Post parent introuvable' })
    parentAuthor = parent.authorUsername
    await Post.findByIdAndUpdate(parentId, { $inc: { replyCount: 1 } })
  }

  const post = await Post.create({
    authorUsername,
    content: cleanContent,
    media: cleanMedia,
    tags: tags ?? [],
    parent: parentId ?? null,
  })

  if (parentAuthor) notifyComment(parentAuthor, authorUsername, parentId)
  notifyMentions(cleanContent, authorUsername, post._id.toString())

  return res.status(201).json({ post })
}

// Upload d'un média (image / GIF) : stocke le fichier et renvoie son URL servie
// par Nginx. Le front l'attache ensuite au post via createPost.
export const uploadPostMedia = (req, res) => {
  const username = req.get('x-user-username')
  if (!username) return res.status(401).json({ message: 'Non authentifié' })
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni' })

  const url = `/uploads/${req.file.filename}`
  const type = req.file.mimetype === 'image/gif' ? 'gif' : 'image'
  return res.status(201).json({ url, type })
}

// Proxy de recherche de GIF Klipy. La clé API reste côté serveur (jamais
// exposée au navigateur). Sans query -> tendances (featured).
const KLIPY_BASE = 'https://api.klipy.com/v2'

export const searchGifs = async (req, res) => {
  const username = req.get('x-user-username')
  if (!username) return res.status(401).json({ message: 'Non authentifié' })

  const apiKey = process.env.KLIPY_API_KEY
  if (!apiKey) return res.status(503).json({ message: 'Recherche GIF indisponible (clé Klipy manquante)' })

  const q = (req.query.q ?? '').toString().trim()
  const pos = (req.query.pos ?? '').toString()
  const params = new URLSearchParams({
    key: apiKey,
    client_key: 'breezy',
    limit: '24',
    media_filter: 'tinygif,gif',
    contentfilter: 'high',
  })
  if (pos) params.set('pos', pos)
  if (q) params.set('q', q)

  try {
    const endpoint = `${KLIPY_BASE}/${q ? 'search' : 'featured'}?${params}`
    const r = await fetch(endpoint)
    if (!r.ok) return res.status(502).json({ message: 'Erreur lors de la recherche Klipy' })

    const data = await r.json()
    const results = normalizeGifResults(data)

    return res.json({ results, next: data.next ?? null })
  } catch {
    return res.status(502).json({ message: 'Erreur lors de la recherche Klipy' })
  }
}

export const getPost = async (req, res) => {
  if (!isObjectId(req.params.id)) return res.status(404).json({ message: 'Post introuvable' })
  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ message: 'Post introuvable' })
  return res.json({ post })
}

export const getReplies = async (req, res) => {
  if (!isObjectId(req.params.id)) return res.status(404).json({ message: 'Post introuvable' })
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
  const skip = (page - 1) * limit

  const posts = await Post.find({ parent: req.params.id })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)

  return res.json(posts)
}

export const getAncestors = async (req, res) => {
  if (!isObjectId(req.params.id)) return res.status(404).json({ message: 'Post introuvable' })
  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ message: 'Post introuvable' })

  // Un commentaire est un post avec un `parent` : on remonte la chaîne du parent
  // direct jusqu'à la racine. Garde-fou (profondeur max) contre une chaîne
  // anormalement longue ou un cycle de données.
  const ancestors = []
  let currentParentId = post.parent
  let depth = 0
  while (currentParentId && depth < 50) {
    const parent = await Post.findById(currentParentId)
    if (!parent) break
    ancestors.push(parent)
    currentParentId = parent.parent
    depth++
  }

  // Renvoyé de la racine au parent direct, pour un affichage de haut en bas.
  return res.json(ancestors.reverse())
}

export const getPostsByUser = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
  const skip = (page - 1) * limit

  // type=posts -> uniquement les posts racines ; type=replies -> uniquement les
  // commentaires (post avec parent) ; absent -> tout (compat ascendante).
  const filter = { authorUsername: req.params.username }
  if (req.query.type === 'posts') filter.parent = null
  else if (req.query.type === 'replies') filter.parent = { $ne: null }

  const posts = await Post.find(filter)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)

  return res.json(posts)
}

export const updatePost = async (req, res) => {
  const username = req.get('x-user-username')
  if (!username) return res.status(401).json({ message: 'Non authentifié' })
  if (!isObjectId(req.params.id)) return res.status(404).json({ message: 'Post introuvable' })

  const { content, media } = req.body
  const cleanContent = typeof content === 'string' ? content.trim() : ''
  if (cleanContent.length > 280) return res.status(400).json({ message: 'Contenu trop long (280 caractères max)' })

  const sanitized = sanitizeMedia(media)
  if (sanitized.error) return res.status(400).json({ message: sanitized.error })

  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ message: 'Post introuvable' })
  if (post.authorUsername !== username) return res.status(403).json({ message: 'Interdit' })

  const cleanMedia = sanitized.media === undefined ? post.media : sanitized.media
  if (!cleanContent && (!cleanMedia || cleanMedia.length === 0)) {
    return res.status(400).json({ message: 'Le contenu ou un média est requis' })
  }

  const tags = [...new Set((cleanContent.match(/#(\w+)/g) ?? []).map(t => t.slice(1)))]
  const updated = await Post.findByIdAndUpdate(
    req.params.id,
    { content: cleanContent, media: cleanMedia, tags, edited: true },
    { new: true }
  )

  return res.json({ post: updated })
}

export const deletePost = async (req, res) => {
  const username = req.get('x-user-username')
  const role = req.get('x-user-role')
  if (!username) return res.status(401).json({ message: 'Non authentifié' })
  if (!isObjectId(req.params.id)) return res.status(404).json({ message: 'Post introuvable' })

  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ message: 'Post introuvable' })

  if (post.authorUsername !== username && role !== 'admin' && role !== 'mod') {
    return res.status(403).json({ message: 'Interdit' })
  }

  if (post.parent) {
    await Post.findByIdAndUpdate(post.parent, { $inc: { replyCount: -1 } })
  }

  await Post.findByIdAndDelete(req.params.id)
  await Like.deleteMany({ post: req.params.id })

  return res.status(204).send()
}

export const getLikeStatus = async (req, res) => {
  const username = req.get('x-user-username')
  if (!username) return res.status(401).json({ message: 'Non authentifié' })
  if (!isObjectId(req.params.id)) return res.status(404).json({ message: 'Post introuvable' })
  const existing = await Like.findOne({ username, post: req.params.id })
  return res.json({ liked: !!existing })
}

export const likePost = async (req, res) => {
  const username = req.get('x-user-username')
  if (!username) return res.status(401).json({ message: 'Non authentifié' })
  if (!isObjectId(req.params.id)) return res.status(404).json({ message: 'Post introuvable' })

  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ message: 'Post introuvable' })

  const existing = await Like.findOne({ username, post: req.params.id })
  if (existing) return res.status(409).json({ message: 'Déjà liké' })

  await Like.create({ username, post: req.params.id })
  const updated = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { likeCount: 1 } },
    { new: true }
  )

  notifyLike(post.authorUsername, username, req.params.id)

  return res.json({ liked: true, count: updated.likeCount })
}

export const unlikePost = async (req, res) => {
  const username = req.get('x-user-username')
  if (!username) return res.status(401).json({ message: 'Non authentifié' })
  if (!isObjectId(req.params.id)) return res.status(404).json({ message: 'Post introuvable' })

  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ message: 'Post introuvable' })

  const like = await Like.findOneAndDelete({ username, post: req.params.id })
  if (!like) return res.status(404).json({ message: 'Like introuvable' })

  const updated = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { likeCount: -1 } },
    { new: true }
  )

  return res.json({ liked: false, count: updated.likeCount })
}

export const getPostsByTag = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
  const skip = (page - 1) * limit

  const posts = await Post.find({ tags: req.params.tag })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)

  return res.json(posts)
}

export const getPostsByAuthors = async (req, res) => {
  const raw = req.query.usernames
  if (!raw) return res.status(400).json({ message: 'Le paramètre usernames est requis' })

  const usernames = raw.split(',').map(u => u.trim()).filter(Boolean)
  if (usernames.length === 0) return res.status(400).json({ message: 'Liste d\'auteurs vide' })

  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
  const skip = (page - 1) * limit

  const posts = await Post.find({ authorUsername: { $in: usernames }, parent: null })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)

  return res.json(posts)
}
