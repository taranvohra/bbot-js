"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerServer = void 0;

var registerServer = function registerServer(message, args, _ref) {
  var id = _ref.id,
      username = _ref.username,
      roles = _ref.roles;
  message.channel.send("Command found. ".concat(id, " ").concat(username));
};

exports.registerServer = registerServer;
//# sourceMappingURL=genericHandlers.js.map