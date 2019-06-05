"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasPrivilegedRole = void 0;

var hasPrivilegedRole = function hasPrivilegedRole(privilegedRoles, userRoles) {
  return privilegedRoles.some(function (pr) {
    return userRoles.find(function (ur) {
      return ur.name === pr;
    });
  });
};

exports.hasPrivilegedRole = hasPrivilegedRole;
//# sourceMappingURL=utils.js.map