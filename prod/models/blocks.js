"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var schema = _mongoose["default"].Schema({
  server_id: String,
  blocked_users: [{
    id: String,
    name: String,
    blocked_on: Date,
    expires_at: Date,
    reason: String
  }]
});

var _default = _mongoose["default"].model('blocks', schema);

exports["default"] = _default;
//# sourceMappingURL=blocks.js.map