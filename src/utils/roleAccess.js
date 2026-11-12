/** Existing accounts without an explicit role are treated as regular users. */
export const roleIsAllowed = (userRole, allowedRoles) =>
  Array.isArray(allowedRoles) && allowedRoles.includes(userRole || 'user');
