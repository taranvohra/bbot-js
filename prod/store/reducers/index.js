"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _redux = require("redux");

var _pugs = _interopRequireDefault(require("./pugs"));

var _queryServers = _interopRequireDefault(require("./queryServers"));

var _blocks = _interopRequireDefault(require("./blocks"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default = (0, _redux.combineReducers)({
  queryServers: _queryServers["default"],
  pugs: _pugs["default"],
  blocks: _blocks["default"]
});

exports["default"] = _default;
//# sourceMappingURL=index.js.map