import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUserRole } from "../../store/slices/authSlice";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "../../utils/rbac";

/**
 * PermissionGuard - Component to conditionally render content based on permissions
 *
 * @param {string} permission - Single permission to check
 * @param {array} permissions - Multiple permissions to check
 * @param {boolean} requireAll - If true, user must have ALL permissions; if false, ANY permission
 * @param {boolean} redirect - If true, redirects to unauthorized page instead of showing fallback
 * @param {string} redirectTo - Custom redirect path (default: '/unauthorized')
 * @param {ReactNode} fallback - Custom content to show when permission denied (default: null)
 * @param {ReactNode} children - Content to render when permission granted
 */
const PermissionGuard = ({
  permission,
  permissions = [],
  requireAll = false,
  redirect = false,
  redirectTo = "/unauthorized",
  fallback = null,
  children,
}) => {
  const userRole = useSelector(selectUserRole);

  // If no role, deny access
  if (!userRole) {
    return redirect ? <Navigate to={redirectTo} replace /> : fallback;
  }

  let hasAccess = true;

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(userRole, permission);
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(userRole, permissions)
      : hasAnyPermission(userRole, permissions);
  }

  // Handle denied access
  if (!hasAccess) {
    return redirect ? <Navigate to={redirectTo} replace /> : fallback;
  }

  // Grant access
  return <>{children}</>;
};

export default PermissionGuard;
