import { useSelector } from 'react-redux';
import { selectUserRole } from '../store/slices/authSlice';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/rbac';

export const usePermission = () => {
  const userRole = useSelector(selectUserRole);

  return {
    hasPermission: (permission) => hasPermission(userRole, permission),
    hasAnyPermission: (permissions) => hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions) => hasAllPermissions(userRole, permissions),
    role: userRole,
  };
};

export default usePermission;
