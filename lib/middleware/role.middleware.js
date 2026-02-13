export const ROLES = {
  TEACHER: 'teacher',
  STUDENT: 'student',
  GUEST: 'guest',
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}

export function requireTeacher(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  if (req.user.role !== ROLES.TEACHER) {
    return res.status(403).json({ error: 'Teacher access required' })
  }

  next()
}

export function requireStudent(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  if (req.user.role !== ROLES.STUDENT && req.user.role !== ROLES.TEACHER) {
    return res.status(403).json({ error: 'Student access required' })
  }

  next()
}
