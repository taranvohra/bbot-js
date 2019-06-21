"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.joinGameTypes = exports.listGameTypes = exports.delGameType = exports.addGameType = void 0;

var _store = _interopRequireDefault(require("../store"));

var _models = require("../models");

var _utils = require("../utils");

var _constants = require("../constants");

var _formats = require("../formats");

var _actions = require("../store/actions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var addGameType =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(_ref, _ref2, serverId, _ref3) {
    var channel, _ref5, gameName, noOfPlayers, noOfTeams, roles, state, gameTypes, pickingOrder, newGameType;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            channel = _ref.channel;
            _ref5 = _slicedToArray(_ref2, 3), gameName = _ref5[0], noOfPlayers = _ref5[1], noOfTeams = _ref5[2];
            roles = _ref3.roles;
            _context.prev = 3;

            if ((0, _utils.hasPrivilegedRole)(_constants.privilegedRoles, roles)) {
              _context.next = 6;
              break;
            }

            return _context.abrupt("return");

          case 6:
            if (!(isNaN(noOfPlayers) || isNaN(noOfTeams) || !gameName)) {
              _context.next = 8;
              break;
            }

            return _context.abrupt("return", channel.send('Invalid command'));

          case 8:
            state = _store["default"].getState();
            gameTypes = state.pugs[serverId].gameTypes;

            if (!gameTypes.some(function (g) {
              return g.name === gameName.toLowerCase();
            })) {
              _context.next = 12;
              break;
            }

            return _context.abrupt("return", channel.send('Gametype already exists'));

          case 12:
            pickingOrder = (0, _utils.computePickingOrder)(parseInt(noOfPlayers), parseInt(noOfTeams));
            newGameType = {
              name: gameName.toLowerCase(),
              pickingOrder: pickingOrder,
              noOfPlayers: parseInt(noOfPlayers),
              noOfTeams: parseInt(noOfTeams)
            };
            _context.next = 16;
            return _models.GameTypes.findOneAndUpdate({
              server_id: serverId
            }, {
              $push: {
                game_types: newGameType
              }
            }).exec();

          case 16:
            _store["default"].dispatch((0, _actions.assignGameTypes)({
              serverId: serverId,
              gameTypes: [].concat(_toConsumableArray(game_types), [newGameType])
            }));

            channel.send("**".concat(gameName, "** has been added"));
            _context.next = 24;
            break;

          case 20:
            _context.prev = 20;
            _context.t0 = _context["catch"](3);
            channel.send('Something went wrong');
            console.log(_context.t0);

          case 24:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 20]]);
  }));

  return function addGameType(_x, _x2, _x3, _x4) {
    return _ref4.apply(this, arguments);
  };
}();

exports.addGameType = addGameType;

var delGameType =
/*#__PURE__*/
function () {
  var _ref9 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(_ref6, _ref7, serverId, _ref8) {
    var channel, _ref10, gameName, rest, roles, state, gameTypes, updatedGameTypes;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            channel = _ref6.channel;
            _ref10 = _toArray(_ref7), gameName = _ref10[0], rest = _ref10.slice(1);
            roles = _ref8.roles;
            _context2.prev = 3;

            if ((0, _utils.hasPrivilegedRole)(_constants.privilegedRoles, roles)) {
              _context2.next = 6;
              break;
            }

            return _context2.abrupt("return");

          case 6:
            state = _store["default"].getState();
            gameTypes = state.pugs[serverId].gameTypes;

            if (gameTypes.some(function (g) {
              return g.name === gameName.toLowerCase();
            })) {
              _context2.next = 10;
              break;
            }

            return _context2.abrupt("return", channel.send("Gametype doesn't exist"));

          case 10:
            updatedGameTypes = gameTypes.filter(function (g) {
              return g.name !== gameName.toLowerCase();
            });
            _context2.next = 13;
            return _models.GameTypes.findOneAndUpdate({
              server_id: serverId
            }, {
              game_types: updatedGameTypes
            }).exec();

          case 13:
            _store["default"].dispatch((0, _actions.assignGameTypes)({
              serverId: serverId,
              gameTypes: updatedGameTypes
            }));

            channel.send("**".concat(gameName, "** has been removed"));
            _context2.next = 21;
            break;

          case 17:
            _context2.prev = 17;
            _context2.t0 = _context2["catch"](3);
            channel.send('Something went wrong');
            console.log(_context2.t0);

          case 21:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 17]]);
  }));

  return function delGameType(_x5, _x6, _x7, _x8) {
    return _ref9.apply(this, arguments);
  };
}();

exports.delGameType = delGameType;

var listGameTypes =
/*#__PURE__*/
function () {
  var _ref12 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(_ref11, _, serverId, __) {
    var channel, state, _state$pugs$serverId, pugChannel, gameTypes, gamesList;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            channel = _ref11.channel;
            _context3.prev = 1;
            state = _store["default"].getState();
            _state$pugs$serverId = state.pugs[serverId], pugChannel = _state$pugs$serverId.pugChannel, gameTypes = _state$pugs$serverId.gameTypes;

            if (!(pugChannel !== channel.id)) {
              _context3.next = 6;
              break;
            }

            return _context3.abrupt("return", channel.send("Active channel for pugs is <#".concat(pugChannel, ">")));

          case 6:
            gamesList = gameTypes.map(function (g) {
              return {
                name: g.name.toUpperCase(),
                players: 0,
                maxPlayers: g.noOfPlayers
              };
            });
            channel.send((0, _formats.formatListGameTypes)(channel.guild.name, gamesList));
            _context3.next = 14;
            break;

          case 10:
            _context3.prev = 10;
            _context3.t0 = _context3["catch"](1);
            channel.send('Something went wrong');
            console.log(_context3.t0);

          case 14:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 10]]);
  }));

  return function listGameTypes(_x9, _x10, _x11, _x12) {
    return _ref12.apply(this, arguments);
  };
}();

exports.listGameTypes = listGameTypes;

var joinGameTypes =
/*#__PURE__*/
function () {
  var _ref15 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(_ref13, args, serverId, _ref14) {
    var channel, id, username, roles, state, _state$pugs$serverId2, pugChannel, list, isPartOfFilledPug, _ref16, _ref16$game_types, game_types, results, i, game;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            channel = _ref13.channel;
            id = _ref14.id, username = _ref14.username, roles = _ref14.roles;
            state = _store["default"].getState();
            _state$pugs$serverId2 = state.pugs[serverId], pugChannel = _state$pugs$serverId2.pugChannel, list = _state$pugs$serverId2.list;

            if (!(pugChannel !== channel.id)) {
              _context4.next = 6;
              break;
            }

            return _context4.abrupt("return", channel.send("Active channel for pugs is <#".concat(pugChannel, ">")));

          case 6:
            if (id) {
              _context4.next = 8;
              break;
            }

            return _context4.abrupt("return", channel.send('No user was mentioned'));

          case 8:
            isPartOfFilledPug = list.find(function (p) {
              return p.picking && p.players.some(function (u) {
                return u.id === id;
              });
            });

            if (!isPartOfFilledPug) {
              _context4.next = 11;
              break;
            }

            return _context4.abrupt("return", channel.send("Please leave **".concat(isPartOfFilledPug.name.toUpperCase(), "** first to join other pugs")));

          case 11:
            _context4.next = 13;
            return _models.GameTypes.findOne({
              server_id: serverId
            }).exec();

          case 13:
            _ref16 = _context4.sent;
            _ref16$game_types = _ref16.game_types;
            game_types = _ref16$game_types === void 0 ? [] : _ref16$game_types;
            results = [];

            for (i = 0; i < args.length; i++) {
              game = args[i].toLowerCase();
            }

          case 18:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function joinGameTypes(_x13, _x14, _x15, _x16) {
    return _ref15.apply(this, arguments);
  };
}();

exports.joinGameTypes = joinGameTypes;
//# sourceMappingURL=pugHandlers.js.map