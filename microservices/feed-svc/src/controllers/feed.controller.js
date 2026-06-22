const USER_SVC_URL = process.env.USER_SVC_URL
const POST_SVC_URL = process.env.POST_SVC_URL
const INTERNAL_SECRET = process.env.INTERNAL_SECRET

export const getFeed = async (req, res) => {
  const username = req.get('x-user-username')
  if (!username) return res.status(401).json({ message: 'Non authentifié' })

  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = 20

  const followingRes = await fetch(`${USER_SVC_URL}/api/users/${username}/following`)
  if (!followingRes.ok) return res.status(502).json({ message: 'Erreur lors de la récupération des abonnements' })

  const following = await followingRes.json()

  // Sequelize raw:true renvoie les clés avec le nom de l'alias : 'followed.username'
  const usernames = following.map(f => f['followed.username']).filter(Boolean)

  if (usernames.length === 0) {
    return res.json({ posts: [], hasMore: false })
  }

  const query = new URLSearchParams({
    usernames: usernames.join(','),
    page,
    limit,
  })

  const postsRes = await fetch(`${POST_SVC_URL}/api/posts/by-authors?${query}`, {
    headers: { 'x-internal-secret': INTERNAL_SECRET },
  })

  if (!postsRes.ok) return res.status(502).json({ message: 'Erreur lors de la récupération des posts' })

  const posts = await postsRes.json()

  return res.json({
    posts,
    hasMore: posts.length === limit,
  })
}
