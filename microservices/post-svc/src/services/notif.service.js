async function sendNotif(type, recipientUsername, actorUsername, relatedPostId) {
  const url = process.env.NOTIF_SVC_URL
  if (!url) return

  try {
    await fetch(`${url}/api/notifs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_SECRET,
      },
      body: JSON.stringify({ type, recipientUsername, actorUsername, relatedPostId }),
    })
  } catch {
    // notif non critique : on ne bloque pas la réponse si notif-svc est down
  }
}

export async function notifyLike(postAuthor, actorUsername, postId) {
  if (postAuthor === actorUsername) return
  await sendNotif('LIKE', postAuthor, actorUsername, postId)
}

export async function notifyComment(parentAuthor, actorUsername, parentPostId) {
  if (parentAuthor === actorUsername) return
  await sendNotif('COMMENT', parentAuthor, actorUsername, parentPostId)
}

export function extractMentionUsernames(content) {
  return [...new Set(content.match(/@(\w+)/g)?.map(m => m.slice(1)) ?? [])]
}

export async function notifyMentions(content, actorUsername, postId, excludedUsernames = []) {
  const excluded = new Set(excludedUsernames)
  const mentioned = extractMentionUsernames(content)
  for (const username of mentioned) {
    if (username === actorUsername) continue
    if (excluded.has(username)) continue
    await sendNotif('MENTION', username, actorUsername, postId)
  }
}
