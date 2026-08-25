import { Request, Response, NextFunction } from 'express';

/**
 * Require specific roles for a route.
 * Usage: requireRole('institution_admin', 'exam_committee')
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Require admin-level access (any admin role).
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const ADMIN_ROLES = [
    'super_admin',
    'institution_admin',
    'exam_committee',
    'faculty',
    'staff',
    'invigilator',
  ];

  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  if (!ADMIN_ROLES.includes(req.user.role)) {
    res.status(403).json({
      error: 'Admin access required',
      current: req.user.role,
    });
    return;
  }

  next();
}

/**
 * Require user management permissions.
 */
export function requireUserManagement(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const USER_MANAGEMENT_ROLES = ['super_admin', 'institution_admin'];

  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  if (!USER_MANAGEMENT_ROLES.includes(req.user.role)) {
    res.status(403).json({
      error: 'User management access required',
      current: req.user.role,
    });
    return;
  }

  next();
}

/**
 * Require exam management permissions.
 */
export function requireExamManagement(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const EXAM_MANAGEMENT_ROLES = ['super_admin', 'institution_admin', 'exam_committee'];

  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  if (!EXAM_MANAGEMENT_ROLES.includes(req.user.role)) {
    res.status(403).json({
      error: 'Exam management access required',
      current: req.user.role,
    });
    return;
  }

  next();
}

/**
 * Require institution-scoped access.
 * Ensures the user's institution_id matches the resource.
 */
export function requireInstitutionAccess(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Super admin bypasses institution checks
  if (req.user?.role === 'super_admin') {
    next();
    return;
  }

  if (!req.user?.institution_id) {
    _res.status(403).json({ error: 'No institution associated with user' });
    return;
  }

  next();
}
