import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../store/slices/authSlice";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "../../utils/rbac";

/**
 * ProtectedRoute - Wrapper for routes that require specific permissions
 * Use this in your route configuration to protect entire pages
 *
 * @example
 * <Route
 *   path="/students"
 *   element={
 *     <ProtectedRoute permission={PERMISSIONS.VIEW_STUDENTS}>
 *       <StudentsPage />
 *     </ProtectedRoute>
 *   }
 * />
 */
const ProtectedRoute = ({
  permission,
  permissions = [],
  requireAll = false,
  redirectTo = "/unauthorized",
  children,
}) => {
  const userRole = useSelector(selectUserRole);

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(userRole, permission);
  }

  if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(userRole, permissions)
      : hasAnyPermission(userRole, permissions);
  }

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
