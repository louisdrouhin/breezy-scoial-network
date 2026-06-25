export const normalizeRole = (role) => {
    if (typeof role !== 'string') return null

    const normalized = role.trim().toUpperCase()
    if (normalized === 'MOD') return 'MODERATOR'
    if (['USER', 'MODERATOR', 'ADMIN'].includes(normalized)) return normalized

    return null
}

export const isKnownRole = (role) => normalizeRole(role) !== null
