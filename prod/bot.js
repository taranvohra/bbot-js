"use strict";

require("@babel/polyfill");

var _dotenv = _interopRequireDefault(require("dotenv"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _discord = require("discord.js");

var _store = _interopRequireDefault(require("./store"));

var _actions = require("./store/actions");

var _models = require("./models");

var _commands = require("./commands");

var _utils = require("./utils");

var _constants = require("./constants");

var _formats = require("./formats");

var _dateFns = require("date-fns");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

_dotenv["default"].config();

var bBot = new _discord.Client({
  disabledEvents: ['TYPING_START', 'CHANNEL_UPDATE', 'USER_UPDATE']
});

function onMessage(_x) {
  return _onMessage.apply(this, arguments);
}
/*
 * BOT
 *  EVENTS
 */


function _onMessage() {
  _onMessage = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(message) {
    var _message$author, id, username, roles, isInvisible, serverId, hasUserMention, mentionedUser, _message$content$subs, _message$content$subs2, first, args, action, soloType, foundCommand;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!message.author.equals(bBot.user)) {
              _context3.next = 2;
              break;
            }

            return _context3.abrupt("return");

          case 2:
            if (message.content.startsWith(_constants.prefix)) {
              _context3.next = 4;
              break;
            }

            return _context3.abrupt("return");

          case 4:
            _message$author = message.author, id = _message$author.id, username = _message$author.username;
            roles = message.member ? message.member.roles : null;
            isInvisible = message.author.presence.status === 'offline';
            serverId = message.guild.id;

            if (serverId) {
              _context3.next = 10;
              break;
            }

            return _context3.abrupt("return");

          case 10:
            hasUserMention = message.mentions.users.first();
            mentionedUser = hasUserMention ? {
              id: hasUserMention.id,
              username: (0, _utils.sanitizeName)(hasUserMention.username)
            } : null;
            _message$content$subs = message.content.substring(_constants.prefix.length).split(' ').filter(Boolean), _message$content$subs2 = _toArray(_message$content$subs), first = _message$content$subs2[0], args = _message$content$subs2.slice(1);
            action = first && first.toLowerCase();
            soloType = args[0] === _constants.offline || args.length === 0 ? 1 : 0;
            foundCommand = _commands.commands.find(function (cmd) {
              return cmd.aliases.includes(action) && (cmd.solo === soloType || cmd.solo === 2);
            });

            if (!foundCommand) {
              _context3.next = 18;
              break;
            }

            return _context3.abrupt("return", _commands.handlers[foundCommand.key](message, args, serverId, {
              id: id,
              roles: roles,
              username: (0, _utils.sanitizeName)(username),
              mentionedUser: mentionedUser,
              isInvisible: isInvisible,
              action: action
            }));

          case 18:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _onMessage.apply(this, arguments);
}

bBot.on('ready', function () {
  console.log("Bot started running at ".concat(new Date().toUTCString()));
  checkIfUserNeedsUnblock();
});
bBot.on('message', onMessage);
bBot.on('presenceUpdate', function (_, _ref) {
  var user = _ref.user,
      guild = _ref.guild,
      status = _ref.presence.status;

  if (status === 'offline') {
    var state = _store["default"].getState();

    var _ref2 = state.pugs[guild.id] || {},
        _ref2$list = _ref2.list,
        list = _ref2$list === void 0 ? [] : _ref2$list,
        pugChannel = _ref2.pugChannel;

    for (var i = 0; i < list.length; i++) {
      var pug = list[i];
      var isInPug = pug.findPlayer(user);

      if (isInPug) {
        var channel = guild.channels.get(pugChannel);
        var message = new _discord.Message(channel, {
          author: new _discord.User(bBot, {
            bot: false,
            id: user.id,
            username: user.username
          }),
          attachments: new Map(),
          embeds: [],
          content: 'lva'
        }, bBot);

        _commands.handlers['leaveAllGameTypes'](message, [_constants.offline], guild.id, {
          id: user.id,
          username: (0, _utils.sanitizeName)(user.username)
        });

        break;
      }
    }
  }
});

_asyncToGenerator(
/*#__PURE__*/
regeneratorRuntime.mark(function _callee() {
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return _mongoose["default"].connect('mongodb://localhost:27017/bBot', {
            useNewUrlParser: true,
            poolSize: 5,
            useFindAndModify: false
          });

        case 3:
          _context.next = 5;
          return hydrateStore();

        case 5:
          bBot.login(process.env.DISCORD_BOT_TOKEN);
          _context.next = 11;
          break;

        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](0);
          console.log('error', _context.t0);

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, null, [[0, 8]]);
}))();

var hydrateStore =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var _ref5, _ref6, dServers, qServers, gameTypes, blocks;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return Promise.all([_models.DiscordServers.find({}).exec(), _models.UT99QueryServers.find({}).exec(), _models.GameTypes.find({}).exec(), _models.Blocks.find({}).exec()]);

          case 2:
            _ref5 = _context2.sent;
            _ref6 = _slicedToArray(_ref5, 4);
            dServers = _ref6[0];
            qServers = _ref6[1];
            gameTypes = _ref6[2];
            blocks = _ref6[3];
            dServers.forEach(function (_ref7) {
              var server_id = _ref7.server_id,
                  pug_channel = _ref7.pug_channel,
                  query_channel = _ref7.query_channel;

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
            qServers.forEach(function (_ref8) {
              var server_id = _ref8.server_id,
                  query_servers = _ref8.query_servers;

              _store["default"].dispatch((0, _actions.assignQueryServers)({
                serverId: server_id,
                list: Array.from(query_servers)
              }));
            });
            gameTypes.forEach(function (_ref9) {
              var server_id = _ref9.server_id,
                  game_types = _ref9.game_types;

              _store["default"].dispatch((0, _actions.assignGameTypes)({
                serverId: server_id,
                gameTypes: Array.from(game_types)
              }));
            });
            blocks.forEach(function (_ref10) {
              var server_id = _ref10.server_id,
                  blocked_users = _ref10.blocked_users;

              _store["default"].dispatch((0, _actions.assignBlocks)({
                serverId: server_id,
                blockedUsers: Array.from(blocked_users)
              }));
            });

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function hydrateStore() {
    return _ref4.apply(this, arguments);
  };
}();
/**
 * P U G
 * E V E N T S
 */


_commands.emitters.pugEventEmitter.on(_constants.pugEvents.captainsReady, function (serverId, name) {
  var state = _store["default"].getState();

  var _state$pugs$serverId = state.pugs[serverId],
      pugChannel = _state$pugs$serverId.pugChannel,
      list = _state$pugs$serverId.list;
  var pug = list.find(function (p) {
    return p.name === name;
  });
  bBot.channels.get(pugChannel).send((0, _formats.formatBroadcastCaptainsReady)(pug));
});

var checkIfUserNeedsUnblock = function checkIfUserNeedsUnblock() {
  setInterval(function () {
    var state = _store["default"].getState();

    Object.entries(state.blocks).forEach(function (_ref11) {
      var _ref12 = _slicedToArray(_ref11, 2),
          serverId = _ref12[0],
          list = _ref12[1].list;

      if (list.length > 0) {
        var guild = bBot.guilds.get(serverId.toString());
        var pugChannel = state.pugs[serverId].pugChannel;
        var channel = guild.channels.get(pugChannel);
        list.forEach(function (user) {
          var mentionedUser = {
            id: user.id,
            username: user.username
          };

          if ((0, _dateFns.compareAsc)(new Date(), user.expires_at) >= 0) {
            _commands.handlers['unblockPlayer']({
              channel: channel
            }, null, serverId, {
              mentionedUser: mentionedUser,
              isBot: true,
              roles: []
            });
          }
        });
      }
    });
  }, 10000);
}; // TODO Remove from store if bot gets removed
//# sourceMappingURL=bot.js.map