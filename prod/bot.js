"use strict";

require("@babel/polyfill");

var _dotenv = _interopRequireDefault(require("dotenv"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _discord = require("discord.js");

var _store = _interopRequireDefault(require("./store"));

var _actions = require("./store/actions");

var _models = require("./models");

var _commands = require("./commands");

var _constants = require("./constants");

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
            if (message.content.startsWith(_constants.prefix)) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return");

          case 4:
            _message$author = message.author, id = _message$author.id, username = _message$author.username;
            roles = message.member.roles;
            serverId = message.channel.guild.id;

            if (serverId) {
              _context.next = 9;
              break;
            }

            return _context.abrupt("return");

          case 9:
            _message$content$subs = message.content.substring(_constants.prefix.length).split(' ').filter(Boolean), _message$content$subs2 = _toArray(_message$content$subs), first = _message$content$subs2[0], args = _message$content$subs2.slice(1);
            action = first && first.toLowerCase();
            foundCommand = _commands.commands.find(function (cmd) {
              return cmd.aliases.includes(action);
            });

            if (!foundCommand) {
              _context.next = 14;
              break;
            }

            return _context.abrupt("return", _commands.handlers[foundCommand.key](message, args, serverId, {
              id: id,
              username: username,
              roles: roles
            }));

          case 14:
            message.channel.send("Command not found");

          case 15:
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
            poolSize: 5,
            useFindAndModify: false
          });

        case 3:
          _context2.next = 5;
          return hydrateStore();

        case 5:
          bBot.login(process.env.DISCORD_BOT_TOKEN);
          _context2.next = 11;
          break;

        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](0);
          console.log('error', _context2.t0);

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2, null, [[0, 8]]);
}))();

var hydrateStore =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    var dServers, qServers;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _models.DiscordServers.find({}).exec();

          case 2:
            dServers = _context3.sent;
            _context3.next = 5;
            return _models.UT99QueryServers.find({}).exec();

          case 5:
            qServers = _context3.sent;
            dServers.forEach(function (_ref4) {
              var server_id = _ref4.server_id,
                  pug_channel = _ref4.pug_channel,
                  query_channel = _ref4.query_channel;

              _store["default"].dispatch((0, _actions.INIT)({
                serverId: server_id
              }));

              _store["default"].dispatch((0, _actions.setPugChannel)({
                serverId: server_id,
                pugChannel: pug_channel
              }));

              _store["default"].dispatch((0, _actions.setQueryChannel)({
                serverId: server_id,
                queryChannel: query_channel
              }));
            });
            qServers.forEach(function (_ref5) {
              var server_id = _ref5.server_id,
                  query_servers = _ref5.query_servers;

              _store["default"].dispatch((0, _actions.assignQueryServers)({
                serverId: server_id,
                list: query_servers
              }));
            });

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function hydrateStore() {
    return _ref3.apply(this, arguments);
  };
}();
//# sourceMappingURL=bot.js.map