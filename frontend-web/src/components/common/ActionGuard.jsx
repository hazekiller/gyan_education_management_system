import { usePermission } from "../../hooks/usePermission";

/**
 * ActionGuard - Wraps any action element (buttons, links, icons) with permission check
 *
 * @example
 * <ActionGuard permission={PERMISSIONS.EDIT_STUDENTS}>
 *   <button onClick={handleEdit}>Edit</button>
 * </ActionGuard>
 *
 * @example
 * <ActionGuard permission={PERMISSIONS.DELETE_STUDENTS} showDisabled>
 *   <button onClick={handleDelete}>Delete</button>
 * </ActionGuard>
 */
const ActionGuard = ({
  permission,
  permissions = [],
  requireAll = false,
  showDisabled = false, // If true, shows disabled element instead of hiding
  disabledClassName = "opacity-50 cursor-not-allowed",
  children,
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
    if (showDisabled) {
      // Clone the child element and add disabled props
      return (
        <div
          className={disabledClassName}
          title="You don't have permission for this action"
        >
          {children}
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
};

export default ActionGuard;
