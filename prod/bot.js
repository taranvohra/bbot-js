"use strict";

require("@babel/polyfill");

var _discord = require("discord.js");

var _mongoose = _interopRequireDefault(require("mongoose"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _store = _interopRequireDefault(require("./store"));

var _contants = require("./contants");

var _commands = _interopRequireDefault(require("./commands"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

_dotenv["default"].config();

var bBot = new _discord.Client({
  disabledEvents: ['TYPING_START', 'CHANNEL_UPDATE', 'USER_UPDATE']
});
bBot.on('message',
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(message) {
    var _message$author, id, username, roles, serverId, _message$content$subs, _message$content$subs2, first, args, action, foundCommand;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!message.author.equals(bBot.user)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return");

          case 2:
            if (message.content.startsWith(_contants.prefix)) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return");

          case 4:
            _message$author = message.author, id = _message$author.id, username = _message$author.username;
            roles = message.member.roles;
            serverId = message.channel.guild.id;
            _message$content$subs = message.content.substring(_contants.prefix.length).split(' ').filter(Boolean), _message$content$subs2 = _toArray(_message$content$subs), first = _message$content$subs2[0], args = _message$content$subs2.slice(1);
            action = first && first.toLowerCase();
            foundCommand = _contants.commands.find(function (cmd) {
              return cmd.aliases.includes(action);
            });

            if (foundCommand) {
              console.log(_commands["default"]);
              console.log(foundCommand.key);

              _commands["default"][foundCommand.key](message, args, {
                id: id,
                username: username,
                roles: roles
              });
            } else {
              message.channel.send("Command not found");
            }

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());
/*
 * BOT
 *  INITIALIZATION
 */

bBot.on('ready', function () {
  console.log("Bot started running at ".concat(new Date().toUTCString()));
});

_asyncToGenerator(
/*#__PURE__*/
regeneratorRuntime.mark(function _callee2() {
  return regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return _mongoose["default"].connect('mongodb://localhost:27017/bBot', {
            useNewUrlParser: true,
            poolSize: 5
          });

        case 3:
          bBot.login(process.env.DISCORD_BOT_TOKEN);
          _context2.next = 9;
          break;

        case 6:
          _context2.prev = 6;
          _context2.t0 = _context2["catch"](0);
          console.log('error', _context2.t0);

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2, null, [[0, 6]]);
}))();
//# sourceMappingURL=bot.js.map