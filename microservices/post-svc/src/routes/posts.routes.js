import { Router } from 'express'
import internalMiddleware from '../middlewares/internal.js'
import {
  createPost,
  getPost,
  getReplies,
  getPostsByUser,
  deletePost,
  likePost,
  unlikePost,
  getPostsByTag,
  getPostsByAuthors,
} from '../controllers/posts.controller.js'

const router = Router()

router.post('/', createPost)
router.get('/by-authors', internalMiddleware, getPostsByAuthors)
router.get('/tags/:tag', getPostsByTag)
router.get('/user/:username', getPostsByUser)
router.get('/:id', getPost)
router.get('/:id/replies', getReplies)
router.delete('/:id', deletePost)
router.post('/:id/like', likePost)
router.delete('/:id/like', unlikePost)

export default router
