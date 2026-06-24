import Post from '../models/post.model.js'
import Like from '../models/like.model.js'
import { notifyLike, notifyComment, notifyMentions } from '../services/notif.service.js'

export const createPost = async (req, res) => {
  const authorUsername = req.get('x-user-username')
  if (!authorUsername) return res.status(401).json({ message: 'Non authentifié' })

  const { content, tags, parentId } = req.body
  if (!content) return res.status(400).json({ message: 'Le contenu est requis' })

  let parentAuthor = null
  if (parentId) {
    const parent = await Post.findById(parentId)
    if (!parent) return res.status(404).json({ message: 'Post parent introuvable' })
    parentAuthor = parent.authorUsername
    await Post.findByIdAndUpdate(parentId, { $inc: { replyCount: 1 } })
  }

  const post = await Post.create({
    authorUsername,
    content,
    tags: tags ?? [],
    parent: parentId ?? null,
  })

  if (parentAuthor) notifyComment(parentAuthor, authorUsername, parentId)
  notifyMentions(content, authorUsername, post._id.toString())

  return res.status(201).json({ post })
}

export const getPost = async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ message: 'Post introuvable' })
  return res.json({ post })
}

export const getReplies = async (req, res) => {
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

  const { content } = req.body
  if (!content || !content.trim()) return res.status(400).json({ message: 'Le contenu est requis' })
  if (content.length > 280) return res.status(400).json({ message: 'Contenu trop long (280 caractères max)' })

  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ message: 'Post introuvable' })
  if (post.authorUsername !== username) return res.status(403).json({ message: 'Interdit' })

  const tags = [...new Set((content.match(/#(\w+)/g) ?? []).map(t => t.slice(1)))]
  const updated = await Post.findByIdAndUpdate(
    req.params.id,
    { content: content.trim(), tags, edited: true },
    { new: true }
  )

  return res.json({ post: updated })
}

export const deletePost = async (req, res) => {
  const username = req.get('x-user-username')
  const role = req.get('x-user-role')
  if (!username) return res.status(401).json({ message: 'Non authentifié' })

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
  const existing = await Like.findOne({ username, post: req.params.id })
  return res.json({ liked: !!existing })
}

export const likePost = async (req, res) => {
  const username = req.get('x-user-username')
  if (!username) return res.status(401).json({ message: 'Non authentifié' })

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
