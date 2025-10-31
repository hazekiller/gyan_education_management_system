// backend/middleware/authorization.js
// Authorization middleware for role- and permission-based access control

const { hasPermission } = require('../config/permissions');

/**
 * Middleware to check a single permission
 * Usage: requirePermission('students', 'read')
 */
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { role } = req.user;

      if (!hasPermission(role, resource, action)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have permission to ${action} ${resource}`,
          requiredPermission: { resource, action, yourRole: role }
        });
      }

      next();
    } catch (error) {
      console.error('requirePermission error:', error);
      return res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
};

/**
 * Middleware to check multiple permissions
 * Usage: requirePermissions([
 *   { resource: 'students', action: 'read' },
 *   { resource: 'classes', action: 'read' }
 * ])
 */
const requirePermissions = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { role } = req.user;

      const hasAllPermissions = permissions.every(perm =>
        hasPermission(role, perm.resource, perm.action)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Missing required permissions',
          requiredPermissions: permissions,
          yourRole: role
        });
      }

      next();
    } catch (error) {
      console.error('requirePermissions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Permissions verification failed',
        error: error.message
      });
    }
  };
};

/**
 * Middleware to check if user has a specific role
 * Usage: requireRole(['super_admin', 'principal'])
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { role } = req.user;

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient privileges',
          requiredRoles: allowedRoles,
          yourRole: role
        });
      }

      next();
    } catch (error) {
      console.error('requireRole error:', error);
      return res.status(500).json({
        success: false,
        message: 'Role verification failed',
        error: error.message
      });
    }
  };
};

/**
 * Middleware to allow access only to own resources
 * Usage: authorizeOwnResource('userId')
 */
const authorizeOwnResource = (userIdField = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const requestedUserId = req.params[userIdField] || req.body[userIdField] || req.query[userIdField];
      const { id: currentUserId, role } = req.user;

      const adminRoles = ['super_admin', 'principal', 'vice_principal'];
      if (adminRoles.includes(role)) {
        return next();
      }

      if (requestedUserId && requestedUserId.toString() !== currentUserId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources'
        });
      }

      next();
    } catch (error) {
      console.error('authorizeOwnResource error:', error);
      return res.status(500).json({
        success: false,
        message: 'Resource authorization failed',
        error: error.message
      });
    }
  };
};

module.exports = {
  requirePermission,
  requirePermissions,
  requireRole,
  authorizeOwnResource,
};
