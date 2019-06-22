"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.leaveGameTypes = exports.joinGameTypes = exports.listGameTypes = exports.delGameType = exports.addGameType = void 0;

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

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Pug =
/*#__PURE__*/
function () {
  function Pug(_ref) {
    var name = _ref.name,
        noOfPlayers = _ref.noOfPlayers,
        noOfTeams = _ref.noOfTeams,
        pickingOrder = _ref.pickingOrder;

    _classCallCheck(this, Pug);

    this.name = name;
    this.noOfPlayers = noOfPlayers;
    this.noOfTeams = noOfTeams;
    this.pickingOrder = pickingOrder;
    this.turn = 0;
    this.picking = false;
    this.players = [];
    this.captains = [];
    this.timer = null;
  } // 0 if couldn't join, 1 if joined, 2 if already in


  _createClass(Pug, [{
    key: "addPlayer",
    value: function addPlayer(user) {
      if (!this.picking) {
        if (this.findPlayer(user)) return 2;
        this.players.push(_objectSpread({
          team: null,
          captain: null,
          pick: null,
          tag: null,
          rating: 0
        }, user));
        this.players.length === this.noOfPlayers ? this.fillPug() : null;
        return 1;
      }

      return 0;
    }
  }, {
    key: "removePlayer",
    value: function removePlayer(user) {}
  }, {
    key: "fillPug",
    value: function fillPug() {
      var _this = this;

      this.picking = true;
      this.timer = setTimeout(function () {
        var remaining = _this.noOfPlayers - _this.captains.length;

        var playersWithoutCaptain = _this.noOfPlayers.filter(function (p) {
          return p.captain === null;
        });

        var poolForCaptains = (0, _utils.shuffle)(playersWithoutCaptain).slice(0, remaining * 0.8).sort(function (a, b) {
          return a.rating - b.rating;
        }); //  TODO
      }, _constants.captainTimeout);
    }
  }, {
    key: "findPlayer",
    value: function findPlayer(user) {
      return this.players.find(function (u) {
        return u.id === user.id;
      });
    }
  }, {
    key: "stopPug",
    value: function stopPug() {
      this.cleanup();
    }
  }, {
    key: "cleanup",
    value: function cleanup() {//  TODO
    }
  }]);

  return Pug;
}();

var addGameType =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(_ref2, _ref3, serverId, _ref4) {
    var channel, _ref6, gameName, noOfPlayers, noOfTeams, roles, state, gameTypes, pickingOrder, newGameType;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            channel = _ref2.channel;
            _ref6 = _slicedToArray(_ref3, 3), gameName = _ref6[0], noOfPlayers = _ref6[1], noOfTeams = _ref6[2];
            roles = _ref4.roles;
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

            if (pickingOrder) {
              _context.next = 15;
              break;
            }

            return _context.abrupt("return", channel.send('Invalid No. of players/teams. Picking order cannot be computed'));

          case 15:
            newGameType = {
              name: gameName.toLowerCase(),
              pickingOrder: pickingOrder,
              noOfPlayers: parseInt(noOfPlayers),
              noOfTeams: parseInt(noOfTeams)
            };
            _context.next = 18;
            return _models.GameTypes.findOneAndUpdate({
              server_id: serverId
            }, {
              $push: {
                game_types: newGameType
              }
            }).exec();

          case 18:
            _store["default"].dispatch((0, _actions.assignGameTypes)({
              serverId: serverId,
              gameTypes: [].concat(_toConsumableArray(game_types), [newGameType])
            }));

            channel.send("**".concat(gameName, "** has been added"));
            _context.next = 26;
            break;

          case 22:
            _context.prev = 22;
            _context.t0 = _context["catch"](3);
            channel.send('Something went wrong');
            console.log(_context.t0);

          case 26:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 22]]);
  }));

  return function addGameType(_x, _x2, _x3, _x4) {
    return _ref5.apply(this, arguments);
  };
}();

exports.addGameType = addGameType;

var delGameType =
/*#__PURE__*/
function () {
  var _ref10 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(_ref7, _ref8, serverId, _ref9) {
    var channel, _ref11, gameName, rest, roles, state, gameTypes, updatedGameTypes;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            channel = _ref7.channel;
            _ref11 = _toArray(_ref8), gameName = _ref11[0], rest = _ref11.slice(1);
            roles = _ref9.roles;
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
    return _ref10.apply(this, arguments);
  };
}();

exports.delGameType = delGameType;

var listGameTypes =
/*#__PURE__*/
function () {
  var _ref13 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(_ref12, _, serverId, __) {
    var channel, state, _state$pugs$serverId, pugChannel, gameTypes, list, tempList, gamesList;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            channel = _ref12.channel;
            _context3.prev = 1;
            state = _store["default"].getState();
            _state$pugs$serverId = state.pugs[serverId], pugChannel = _state$pugs$serverId.pugChannel, gameTypes = _state$pugs$serverId.gameTypes, list = _state$pugs$serverId.list;

            if (!(pugChannel !== channel.id)) {
              _context3.next = 6;
              break;
            }

            return _context3.abrupt("return", channel.send("Active channel for pugs is <#".concat(pugChannel, ">")));

          case 6:
            tempList = gameTypes.map(function (g) {
              return {
                name: g.name,
                players: 0,
                maxPlayers: g.noOfPlayers
              };
            });
            gamesList = tempList.reduce(function (acc, curr) {
              var existingPug = list.find(function (p) {
                return p.name === curr.name;
              });

              if (existingPug) {
                acc.push({
                  name: existingPug.name,
                  maxPlayers: existingPug.noOfPlayers,
                  players: existingPug.players.length
                });
              } else {
                acc.push(curr);
              }

              return acc;
            }, []);
            channel.send((0, _formats.formatListGameTypes)(channel.guild.name, gamesList));
            _context3.next = 15;
            break;

          case 11:
            _context3.prev = 11;
            _context3.t0 = _context3["catch"](1);
            channel.send('Something went wrong');
            console.log(_context3.t0);

          case 15:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 11]]);
  }));

  return function listGameTypes(_x9, _x10, _x11, _x12) {
    return _ref13.apply(this, arguments);
  };
}();

exports.listGameTypes = listGameTypes;

var joinGameTypes =
/*#__PURE__*/
function () {
  var _ref16 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(_ref14, args, serverId, _ref15) {
    var channel, id, username, roles, state, _state$pugs$serverId2, pugChannel, list, gameTypes, isPartOfFilledPug, user, statuses;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            channel = _ref14.channel;
            id = _ref15.id, username = _ref15.username, roles = _ref15.roles;
            _context4.prev = 2;
            state = _store["default"].getState();
            _state$pugs$serverId2 = state.pugs[serverId], pugChannel = _state$pugs$serverId2.pugChannel, list = _state$pugs$serverId2.list, gameTypes = _state$pugs$serverId2.gameTypes;

            if (!(pugChannel !== channel.id)) {
              _context4.next = 7;
              break;
            }

            return _context4.abrupt("return", channel.send("Active channel for pugs is <#".concat(pugChannel, ">")));

          case 7:
            if (id) {
              _context4.next = 9;
              break;
            }

            return _context4.abrupt("return", channel.send('No user was mentioned'));

          case 9:
            isPartOfFilledPug = list.find(function (p) {
              return p.picking && p.players.some(function (u) {
                return u.id === id;
              });
            });

            if (!isPartOfFilledPug) {
              _context4.next = 12;
              break;
            }

            return _context4.abrupt("return", channel.send("Please leave **".concat(isPartOfFilledPug.name.toUpperCase(), "** first to join other pugs")));

          case 12:
            user = {
              id: id,
              username: username,
              roles: roles
            };
            statuses = args.map(function (a) {
              var game = a.toLowerCase();
              var gameType = gameTypes.find(function (g) {
                return g.name === game;
              });
              if (!gameType) return {
                user: user,
                name: game,
                joined: -1
              }; // -1 is for NOT FOUND

              var existingPug = list.find(function (p) {
                return p.name === game;
              });
              var pug = existingPug || new Pug(gameType);
              var joined = pug.addPlayer(user);

              if (!existingPug && joined) {
                _store["default"].dispatch((0, _actions.addNewPug)({
                  serverId: serverId,
                  newPug: pug
                }));
              }

              return {
                user: user,
                joined: joined,
                name: game,
                activeCount: pug.players.length,
                maxPlayers: pug.noOfPlayers
              };
            });
            channel.send((0, _formats.formatJoinStatus)(statuses));
            _context4.next = 21;
            break;

          case 17:
            _context4.prev = 17;
            _context4.t0 = _context4["catch"](2);
            channel.send('Something went wrong');
            console.log(_context4.t0);

          case 21:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[2, 17]]);
  }));

  return function joinGameTypes(_x13, _x14, _x15, _x16) {
    return _ref16.apply(this, arguments);
  };
}();

exports.joinGameTypes = joinGameTypes;

var leaveGameTypes =
/*#__PURE__*/
function () {
  var _ref19 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5(_ref17, args, serverId, _ref18) {
    var channel, id, username, roles, state, _state$pugs$serverId3, pugChannel, list, gameTypes, isPartOfFilledPug, user, statuses;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            channel = _ref17.channel;
            id = _ref18.id, username = _ref18.username, roles = _ref18.roles;
            _context5.prev = 2;
            state = _store["default"].getState();
            _state$pugs$serverId3 = state.pugs[serverId], pugChannel = _state$pugs$serverId3.pugChannel, list = _state$pugs$serverId3.list, gameTypes = _state$pugs$serverId3.gameTypes;

            if (!(pugChannel !== channel.id)) {
              _context5.next = 7;
              break;
            }

            return _context5.abrupt("return", channel.send("Active channel for pugs is <#".concat(pugChannel, ">")));

          case 7:
            if (id) {
              _context5.next = 9;
              break;
            }

            return _context5.abrupt("return", channel.send('No user was mentioned'));

          case 9:
            isPartOfFilledPug = list.find(function (p) {
              return p.picking && p.players.some(function (u) {
                return u.id === id;
              });
            });

            if (!isPartOfFilledPug) {
              _context5.next = 12;
              break;
            }

            return _context5.abrupt("return", channel.send("Please leave **".concat(isPartOfFilledPug.name.toUpperCase(), "** first to join other pugs")));

          case 12:
            user = {
              id: id,
              username: username,
              roles: roles
            };
            statuses = args.map(function (a) {
              var game = a.toLowerCase();
              var gameType = gameTypes.find(function (g) {
                return g.name === game;
              });
              if (!gameType) return {
                user: user,
                name: game,
                joined: -1
              }; // -1 is for NOT FOUND

              var existingPug = list.find(function (p) {
                return p.name === game;
              });
              var pug = existingPug || new Pug(gameType);
              var joined = pug.addPlayer(user);

              if (!existingPug && joined) {
                _store["default"].dispatch((0, _actions.addNewPug)({
                  serverId: serverId,
                  newPug: pug
                }));
              }

              return {
                user: user,
                joined: joined,
                name: game,
                activeCount: pug.players.length,
                maxPlayers: pug.noOfPlayers
              };
            });
            channel.send((0, _formats.formatJoinStatus)(statuses));
            _context5.next = 21;
            break;

          case 17:
            _context5.prev = 17;
            _context5.t0 = _context5["catch"](2);
            channel.send('Something went wrong');
            console.log(_context5.t0);

          case 21:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[2, 17]]);
  }));

  return function leaveGameTypes(_x17, _x18, _x19, _x20) {
    return _ref19.apply(this, arguments);
  };
}();

exports.leaveGameTypes = leaveGameTypes;
//# sourceMappingURL=pugHandlers.js.map