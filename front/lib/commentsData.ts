export interface Comment {
  id: string;
  displayName: string;
  username: string;
  content: string;
  createdAt: string;
  likes: number;
  parentId?: string;
  replies?: Comment[];
}

const now = new Date();
const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
const twentyMinsAgo = new Date(now.getTime() - 20 * 60 * 1000);
const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const ninetyMinsAgo = new Date(now.getTime() - 90 * 60 * 1000);
const eightyMinsAgo = new Date(now.getTime() - 80 * 60 * 1000);
const seventyMinsAgo = new Date(now.getTime() - 70 * 60 * 1000);

export const mockComments: Comment[] = [
  {
    id: '1',
    displayName: 'Alice Johnson',
    username: 'alicejohnson',
    content: 'This is amazing! Great work! 🎉',
    createdAt: oneHourAgo.toISOString(),
    likes: 12,
    replies: [
      {
        id: '1-1',
        displayName: 'John Doe',
        username: 'johndoe',
        content: 'Thanks Alice!',
        createdAt: thirtyMinsAgo.toISOString(),
        likes: 2,
        parentId: '1',
        replies: [
          {
            id: '1-1-1',
            displayName: 'Bob Smith',
            username: 'bobsmith',
            content: 'Great conversation!',
            createdAt: twentyMinsAgo.toISOString(),
            likes: 1,
            parentId: '1-1',
            replies: [],
          },
        ],
      },
      {
        id: '1-2',
        displayName: 'Carol White',
        username: 'carolwhite',
        content: 'I totally agree!',
        createdAt: fifteenMinsAgo.toISOString(),
        likes: 5,
        parentId: '1',
        replies: [],
      },
    ],
  },
  {
    id: '2',
    displayName: 'Bob Smith',
    username: 'bobsmith',
    content: 'Thanks for sharing this!',
    createdAt: twoHoursAgo.toISOString(),
    likes: 5,
    replies: [
      {
        id: '2-1',
        displayName: 'Alice Johnson',
        username: 'alicejohnson',
        content: 'You are welcome!',
        createdAt: ninetyMinsAgo.toISOString(),
        likes: 3,
        parentId: '2',
        replies: [
          {
            id: '2-1-1',
            displayName: 'John Doe',
            username: 'johndoe',
            content: 'Nice exchange!',
            createdAt: eightyMinsAgo.toISOString(),
            likes: 2,
            parentId: '2-1',
            replies: [
              {
                id: '2-1-1-1',
                displayName: 'Carol White',
                username: 'carolwhite',
                content: 'Indeed!',
                createdAt: seventyMinsAgo.toISOString(),
                likes: 1,
                parentId: '2-1-1',
                replies: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

export function findCommentById(id: string, comments: Comment[] = mockComments): Comment | null {
  for (const comment of comments) {
    if (comment.id === id) {
      return comment;
    }
    if (comment.replies && comment.replies.length > 0) {
      const found = findCommentById(id, comment.replies);
      if (found) return found;
    }
  }
  return null;
}

// Helper to flatten all comments into one list for easier searching
function getAllComments(comments: Comment[]): Comment[] {
  let all: Comment[] = [];
  for (const comment of comments) {
    all.push(comment);
    if (comment.replies && comment.replies.length > 0) {
      all = all.concat(getAllComments(comment.replies));
    }
  }
  return all;
}

export function getParentChain(id: string, comments: Comment[] = mockComments): Comment[] {
  const allComments = getAllComments(comments);
  const commentMap = new Map<string, Comment>();

  // Build a map for O(1) lookup
  for (const comment of allComments) {
    commentMap.set(comment.id, comment);
  }

  const chain: Comment[] = [];
  let currentId: string | undefined = id;

  while (currentId) {
    const comment = commentMap.get(currentId);
    if (!comment) break;
    chain.unshift(comment);
    currentId = comment.parentId;
  }

  return chain;
}

export function getReplyCount(comment: Comment): number {
  if (!comment.replies) return 0;
  return comment.replies.length + comment.replies.reduce((sum, reply) => sum + getReplyCount(reply), 0);
}
