"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var schema = _mongoose["default"].Schema({
  server_id: Number,
  query_servers: [{
    key: String,
    name: String,
    host: String,
    port: String,
    timestamp: Number
  }]
});

var _default = _mongoose["default"].model('ut99_query_servers', schema);

exports["default"] = _default;
//# sourceMappingURL=ut99QueryServers.js.map