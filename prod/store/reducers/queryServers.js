"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var queryServers = function queryServers() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _ref = arguments.length > 1 ? arguments[1] : undefined,
      type = _ref.type,
      payload = _ref.payload;

  switch (type) {
    case 'SET_QUERY_CHANNEL':
      {
        console.log(payload.serverId);
        return _objectSpread({}, state, _defineProperty({}, payload.serverId, _objectSpread({}, state[payload.serverId], {
          queryChannel: payload.queryChannel
        })));
      }

    case 'ADD_QUERY_SERVER':
      {
        return;
      }

    case 'REMOVE_QUERY_SERVER':
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