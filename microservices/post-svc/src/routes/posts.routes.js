import { Router } from 'express'
import internalMiddleware from '../middlewares/internal.js'
import { uploadMedia } from '../middlewares/upload.middleware.js'
import {
  createPost,
  uploadPostMedia,
  searchGifs,
  getPost,
  getReplies,
  getAncestors,
  getPostsByUser,
  updatePost,
  deletePost,
  getLikeStatus,
  likePost,
  unlikePost,
  getPostsByTag,
  getPostsByAuthors,
} from '../controllers/posts.controller.js'

const router = Router()

const requireUser = (req, res, next) => {
  if (!req.get('x-user-username')) return res.status(401).json({ message: 'Non authentifié' })
  next()
}

router.post('/', createPost)
router.post('/media', requireUser, uploadMedia, uploadPostMedia)
router.get('/gifs/search', searchGifs)
router.get('/gifs', searchGifs)
router.get('/by-authors', internalMiddleware, getPostsByAuthors)
router.get('/tags/:tag', getPostsByTag)
router.get('/user/:username', getPostsByUser)
router.get('/:id', getPost)
router.get('/:id/replies', getReplies)
router.get('/:id/ancestors', getAncestors)
router.patch('/:id', updatePost)
router.delete('/:id', deletePost)
router.get('/:id/like', getLikeStatus)
router.post('/:id/like', likePost)
router.delete('/:id/like', unlikePost)

export default router
