async function sendNotif(type, recipientUsername, actorUsername) {
  const url = process.env.NOTIF_SVC_URL;
  if (!url) return;

  try {
    await fetch(`${url}/api/notifs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_SECRET,
      },
      body: JSON.stringify({ type, recipientUsername, actorUsername, relatedPostId: null }),
    });
  } catch {
    // non-critical: don't block response if notif-svc is down
  }
}

export async function notifyFollow(followedUsername, followerUsername) {
  if (followedUsername === followerUsername) return;
  await sendNotif('NEW_FOLLOWER', followedUsername, followerUsername);
}
