"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var schema = _mongoose["default"].Schema({
  id: String,
  username: String,
  server_id: String,
  default_joins: Array,
  last_pug: Object,
  stats: Object
});

var _default = _mongoose["default"].model('users', schema);

exports["default"] = _default;
//# sourceMappingURL=users.js.map