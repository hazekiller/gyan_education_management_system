import { useSelector } from 'react-redux';
import { selectUserRole } from '../../store/slices/authSlice';
import { hasPermission, hasAnyPermission } from '../../utils/rbac';

const PermissionGuard = ({ 
  permission, 
  permissions = [], 
  requireAll = false,
  fallback = null,
  children 
}) => {
  const userRole = useSelector(selectUserRole);

  // Check single permission
  if (permission) {
    if (!hasPermission(userRole, permission)) {
      return fallback;
    }
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasAccess = requireAll
      ? permissions.every(p => hasPermission(userRole, p))
      : permissions.some(p => hasPermission(userRole, p));

    if (!hasAccess) {
      return fallback;
    }
  }

  return <>{children}</>;
};

export default PermissionGuard;
