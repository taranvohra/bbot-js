"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var queryServers = function queryServers() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case 'ADD_QUERY_SERVER':
      {
        return;
      }

    case 'DELETE_QUERY_SERVER':
      {
        return;
      }

    default:
      return state;
  }
};

var _default = queryServers;
exports["default"] = _default;
//# sourceMappingURL=queryServers.js.map