import Notification from "../models/notification.model.js"

export const getNotifs = async (req, res) => {
    const username = req.get('x-user-username')
    const role = req.get('x-user-role')

    if (!username || !role) {
        return res.status(400).json({ message: 'Missing arguments' })
    }

    const allowedTypes = role === 'user'
        ? ['MENTION', 'LIKE', 'NEW_FOLLOWER', 'COMMENT']
        : ['MENTION']

    const notifs = await Notification.find({
        recipientUsername: username,
        type: { $in: allowedTypes }
    }).sort({ created_at: -1 })

    return res.json(notifs)
}

export const markAsRead = async (req, res) => {
    const username = req.get('x-user-username')
    const { id } = req.params

    if (!username || !id) {
        return res.status(400).json({ message: 'Missing arguments' })
    }

    const notif = await Notification.findById(id)

    if (!notif) return res.status(404).json({ message: 'Notification not found' })
    if (notif.recipientUsername !== username) return res.status(403).json({ message: 'Forbidden' })

    await Notification.findByIdAndUpdate(id, { read: true })

    return res.status(200).json({ read: true })
}

export const markAllAsRead = async (req, res) => {
    const username = req.get('x-user-username')

    if (!username) return res.status(400).json({ message: 'Missing user' })

    const result = await Notification.updateMany(
        { recipientUsername: username, read: false },
        { read: true }
    )

    return res.status(200).json({ updated: result.modifiedCount })
}

export const createNotif = async (req, res) => {
    const { type, recipientUsername, actorUsername, relatedPostId } = req.body

    if (!type || !recipientUsername) {
        return res.status(400).json({ message: 'Missing arguments' })
    }

    if (!['MENTION', 'LIKE', 'NEW_FOLLOWER', 'COMMENT'].includes(type)) {
        return res.status(400).json({ message: 'Invalid notification type' })
    }

    const notif = await Notification.create({ type, recipientUsername, actorUsername, relatedPostId })

    return res.status(201).json({ notif })
}
