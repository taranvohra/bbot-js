"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var pugs = function pugs() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _ref = arguments.length > 1 ? arguments[1] : undefined,
      type = _ref.type,
      payload = _ref.payload;

  switch (type) {
    case 'INIT':
      {
        return _defineProperty({}, payload.serverId, {
          pugChannel: null,
          list: []
        });
      }

    case 'SET_PUG_CHANNEL':
      {
        return _objectSpread({}, state, _defineProperty({}, payload.serverId, _objectSpread({}, state[payload.serverId], {
          pugChannel: payload.pugChannel
        })));
      }

    default:
      return state;
  }
};

var _default = pugs;
exports["default"] = _default;
//# sourceMappingURL=pugs.js.map