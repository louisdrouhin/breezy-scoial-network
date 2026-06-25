export const ROLES = {
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
}

export const normalizeRole = (role) => {
  if (typeof role !== 'string') return null

  const normalized = role.trim().toUpperCase()
  if (normalized === 'MOD') return ROLES.MODERATOR
  if (Object.values(ROLES).includes(normalized)) return normalized

  return null
}

export const isModeratorRole = (role) => normalizeRole(role) === ROLES.MODERATOR

export const isAdminRole = (role) => normalizeRole(role) === ROLES.ADMIN

export const canEditPost = ({ username }, authorUsername) => {
  return Boolean(username && authorUsername && username === authorUsername)
}

export const canDeletePost = ({ username, role }, authorUsername) => {
  return canEditPost({ username }, authorUsername) || isAdminRole(role) || isModeratorRole(role)
}
