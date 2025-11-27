import { usePermission } from "../../hooks/usePermission";

/**
 * PermissionButton - Button that only renders if user has permission
 *
 * @example
 * <PermissionButton
 *   permission={PERMISSIONS.CREATE_STUDENTS}
 *   onClick={handleCreate}
 *   className="btn-primary"
 * >
 *   Add Student
 * </PermissionButton>
 */
const PermissionButton = ({
  permission,
  permissions = [],
  requireAll = false,
  onClick,
  disabled = false,
  className = "",
  children,
  ...props
}) => {
  const {
    hasPermission: checkPermission,
    hasAnyPermission,
    hasAllPermissions,
  } = usePermission();

  let hasAccess = true;

  if (permission) {
    hasAccess = checkPermission(permission);
  }

  if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

export default PermissionButton;
