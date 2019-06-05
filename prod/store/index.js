"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _redux = require("redux");

var _reducers = _interopRequireDefault(require("./reducers"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
 * THE STORE IS THE REAL TIME CACHE BOT USES
 * SHAPE OF STORE: {
 *      pugs: { byDiscordServerId: {} },
 *      blocks: { byDiscordServerId: {} },
 *      queryServers: { byDiscordServerId: {} },
 * }
 */
var store = (0, _redux.createStore)(_reducers["default"]);
var _default = store;
exports["default"] = _default;
//# sourceMappingURL=index.js.map