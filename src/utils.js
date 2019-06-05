export const hasPrivilegedRole = (privilegedRoles, userRoles) =>
  privilegedRoles.some(pr => userRoles.find(ur => ur.name === pr));
