"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var schema = _mongoose["default"].Schema({
  server_id: String,
  name: String,
  timestamp: Date,
  pug: Object,
  winner: Number
});

var _default = _mongoose["default"].model('pugs', schema);

exports["default"] = _default;
//# sourceMappingURL=pugs.js.map