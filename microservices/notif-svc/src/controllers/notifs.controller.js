import prisma from "../config/db..js"

export const getNotifs = async (req, res) => {
    const username = req.get('x-user-username');
    const role = req.get('x-user-role');

    if (!username || !role) {
        return res.status(400).json({ message: 'Missing arguments' });
    }

    const allowedTypes = role === 'user'
  ? ['MENTION', 'LIKE', 'NEW_FOLLOWER', 'COMMENT']
  : ['MENTION']

    const notifs = await prisma.notification.findMany({
      where: {
        recipientUsername: username,
        type: { in: allowedTypes }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.json(notifs);
}

export const markAsRead = async (req, res) => {
    const username = req.get('x-user-username');
    const id = req.params("id");


}
export const markAllAsRead = async (req, res) => {}
export const createNotif = async (req, res) => {}
