"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var blocks = function blocks() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _ref = arguments.length > 1 ? arguments[1] : undefined,
      type = _ref.type,
      payload = _ref.payload;

  switch (type) {
    // TODO INIT for hydrating blocks from DB
    case 'INIT':
      {
        return _defineProperty({}, payload.serverId, {
          list: []
        });
      }

    default:
      return state;
  }
};

var _default = blocks;
exports["default"] = _default;
//# sourceMappingURL=blocks.js.map