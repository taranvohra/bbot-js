"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var queryServers = function queryServers() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _ref = arguments.length > 1 ? arguments[1] : undefined,
      type = _ref.type,
      payload = _ref.payload;

  switch (type) {
    case 'INIT':
      {
        return _objectSpread({}, state, _defineProperty({}, payload.serverId, {
          queryChannel: null,
          list: []
        }));
      }

    case 'SET_QUERY_CHANNEL':
      {
        return _objectSpread({}, state, _defineProperty({}, payload.serverId, _objectSpread({}, state[payload.serverId], {
          queryChannel: payload.queryChannel,
          list: []
        })));
      }

    case 'ADD_QUERY_SERVER':
      {
        var _state$payload$server = state[payload.serverId].list,
            list = _state$payload$server === void 0 ? [] : _state$payload$server;
        return _objectSpread({}, state, _defineProperty({}, payload.serverId, _objectSpread({}, state[payload.serverId], {
          list: [].concat(_toConsumableArray(list), [payload.queryServer])
        })));
      }

    case 'REMOVE_QUERY_SERVER':
      {
        var _state$payload$server2 = state[payload.serverId].list,
            _list = _state$payload$server2 === void 0 ? [] : _state$payload$server2;

        var sortedList = _list.sort(function (a, b) {
          return a.timestamp - b.timestamp;
        });

        var updatedList = sortedList.filter(function (_, i) {
          return i !== payload.index;
        });
        return _objectSpread({}, state, _defineProperty({}, payload.serverId, _objectSpread({}, state[payload.serverId], {
          list: updatedList
        })));
      }

    case 'ASSIGN_QUERY_SERVERS':
      {
        return _objectSpread({}, state, _defineProperty({}, payload.serverId, _objectSpread({}, state[payload.serverId], {
          list: payload.list
        })));
      }

    default:
      return state;
  }
};

var _default = queryServers;
exports["default"] = _default;
//# sourceMappingURL=queryServers.js.map