"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.blockPlayer = exports.adminPickPlayer = exports.adminRemovePlayer = exports.adminAddPlayer = exports.addOrRemoveTag = exports.checkStats = exports.decidePromoteOrPick = exports.resetPug = exports.checkLastPugs = exports.promoteAvailablePugs = exports.pugPicking = exports.pickPlayer = exports.addCaptain = exports.leaveAllGameTypes = exports.leaveGameTypes = exports.joinGameTypes = exports.listAllCurrentGameTypes = exports.listGameTypes = exports.delGameType = exports.addGameType = exports.pugEventEmitter = void 0;

var _store = _interopRequireDefault(require("../store"));

var _models = require("../models");

var _utils = require("../utils");

var _constants = require("../constants");

var _formats = require("../formats");

var _actions = require("../store/actions");

var _events = _interopRequireDefault(require("events"));

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

var pugEventEmitter = new _events["default"].EventEmitter();
exports.pugEventEmitter = pugEventEmitter;

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
          rating: user.stats[this.name] ? user.stats[this.name].totalRating : 0
        }, user));
        return 1;
      }

      return 0;
    }
  }, {
    key: "removePlayer",
    value: function removePlayer(user) {
      var playerIndex = this.players.findIndex(function (p) {
        return p.id === user.id;
      });
      this.players.splice(playerIndex, 1);
      if (this.picking) this.stopPug();
    }
  }, {
    key: "fillPug",
    value: function fillPug(serverId) {
      var _this = this;

      this.picking = true;
      this.timer = setTimeout(function () {
        var remaining = _this.noOfPlayers - _this.captains.length;

        var playersWithoutCaptain = _this.players.filter(function (p) {
          return p.captain === null;
        });

        var poolForCaptains = (0, _utils.shuffle)(playersWithoutCaptain).slice(0, remaining * 0.8).sort(function (a, b) {
          return a.rating - b.rating;
        });

        if (_this.noOfTeams === 2) {
          if (_this.captains.length === 0) {
            var leastDiff = 0;
            var pair = [0, 1];

            for (var i = 1; i < poolForCaptains.length - 1; i++) {
              var left = {
                pair: [i, i - 1],
                diff: Math.abs(poolForCaptains[i].rating - poolForCaptains[i - 1].rating)
              };
              var right = {
                pair: [i, i + 1],
                diff: Math.abs(poolForCaptains[i].rating - poolForCaptains[i + 1].rating)
              };
              var smallest = Math.min(left.diff, right.diff);

              if (smallest === left.diff && smallest <= leastDiff) {
                leastDiff = left.diff;
                pair = left.pair;
              } else if (smallest === right.diff && smallest <= leastDiff) {
                leastDiff = right.diff;
                pair = right.pair;
              }
            }

            var firstCaptain = poolForCaptains[pair[0]];
            var secondCaptain = poolForCaptains[pair[1]];

            _this.fillCaptainSpot(firstCaptain, firstCaptain.rating >= secondCaptain.rating ? 0 : 1);

            _this.fillCaptainSpot(secondCaptain, firstCaptain.rating >= secondCaptain.rating ? 1 : 0);
          } else {
            // 1 capt already there
            var _firstCaptain = _this.players.find(function (u) {
              return u.captain !== null;
            });

            var _leastDiff = 10000;
            var otherCaptainIndex = null;

            for (var _i = 0; _i < poolForCaptains.length; _i++) {
              var diff = Math.abs(_firstCaptain.rating - poolForCaptains[_i].rating);

              if (diff <= _leastDiff) {
                _leastDiff = diff;
                otherCaptainIndex = _i;
              }
            }

            var otherCaptain = poolForCaptains[otherCaptainIndex];
            var otherCaptainTeam = Math.abs(_firstCaptain.team % 2 - 1);

            _this.fillCaptainSpot(otherCaptain, otherCaptainTeam);
          }
        } else {
          // more than 2 capts
          for (var _i2 = 0; _i2 < _this.noOfTeams; _i2++) {
            if (_this.captains[_i2]) continue;

            while (1) {
              var pIndex = (0, _utils.getRandomInt)(0, poolForCaptains.length - 1);

              var didFillSpot = _this.fillCaptainSpot(poolForCaptains[pIndex], _i2);

              if (didFillSpot) break;
            }
          }
        }

        pugEventEmitter.emit(_constants.pugEvents.captainsReady, serverId, _this.name); //  TODO
      }, _constants.captainTimeout);
    }
  }, {
    key: "addCaptain",
    value: function addCaptain(user) {
      var teamIndex;

      while (1) {
        teamIndex = (0, _utils.getRandomInt)(0, this.noOfTeams - 1);
        var didFillSpot = this.fillCaptainSpot(user, teamIndex);
        if (didFillSpot) break;
      }

      if (this.areCaptainsDecided()) clearTimeout(this.timer);
      return {
        team: teamIndex,
        captainsDecided: this.areCaptainsDecided()
      };
    }
  }, {
    key: "fillCaptainSpot",
    value: function fillCaptainSpot(user, teamIndex) {
      var pIndex = this.players.findIndex(function (u) {
        return u.id === user.id;
      });

      if (this.players[pIndex].captain === null && !this.captains[teamIndex]) {
        this.players[pIndex].captain = this.players[pIndex].team = teamIndex;
        this.players[pIndex].pick = 0;
        this.captains[teamIndex] = this.players[pIndex];
        return true;
      }

      return false;
    }
  }, {
    key: "pickPlayer",
    value: function pickPlayer(playerIndex, team) {
      if (this.players[playerIndex].team === null) {
        this.players[playerIndex].team = team;
        this.turn += 1;
        this.players[playerIndex].pick = this.turn;
        var pickedPlayers = [{
          player: this.players[playerIndex],
          team: team
        }]; // last pick automatically goes

        if (this.turn === this.pickingOrder.length - 1) {
          var lastPlayerIndex = this.players.findIndex(function (u) {
            return u.team === null;
          });
          var lastPlayerTeam = this.pickingOrder[this.turn];
          this.players[lastPlayerIndex].team = lastPlayerTeam;
          this.turn += 1;
          this.players[lastPlayerIndex].pick = this.turn; // pug ends

          this.picking = false;
          pickedPlayers.push({
            player: this.players[lastPlayerIndex],
            team: lastPlayerTeam
          });
          return {
            pickedPlayers: pickedPlayers,
            finished: true
          };
        }

        return {
          pickedPlayers: pickedPlayers,
          finished: false
        };
      }
    }
  }, {
    key: "addTag",
    value: function addTag(user, tag) {
      this.players.forEach(function (u) {
        if (u.id === user.id) {
          u.tag = tag;
        }
      });
    }
  }, {
    key: "removeTag",
    value: function removeTag(user) {
      this.players.forEach(function (u) {
        if (u.id === user.id) {
          u.tag = null;
        }
      });
    }
  }, {
    key: "resetPug",
    value: function resetPug(serverId) {
      this.stopPug();
      this.fillPug(serverId);
    }
  }, {
    key: "stopPug",
    value: function stopPug() {
      this.cleanup();
    }
  }, {
    key: "findPlayer",
    value: function findPlayer(user) {
      return this.players.find(function (u) {
        return u.id === user.id;
      });
    }
  }, {
    key: "isEmpty",
    value: function isEmpty() {
      return this.players.length === 0 ? true : false;
    }
  }, {
    key: "areCaptainsDecided",
    value: function areCaptainsDecided() {
      return this.captains.filter(Boolean).length === this.noOfTeams;
    }
  }, {
    key: "cleanup",
    value: function cleanup() {
      //  TODO
      this.picking = false;
      this.turn = 0;
      this.captains = [];
      this.players.forEach(function (user) {
        return user.captain = user.team = user.pick = null;
      });
      clearTimeout(this.timer);
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
              gameTypes: [].concat(_toConsumableArray(gameTypes), [newGameType])
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

            return _context3.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "not present")));

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

var listAllCurrentGameTypes =
/*#__PURE__*/
function () {
  var _ref15 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(_ref14, _, serverId, __) {
    var channel, state, _state$pugs$serverId2, pugChannel, list;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            channel = _ref14.channel;
            _context4.prev = 1;
            state = _store["default"].getState();
            _state$pugs$serverId2 = state.pugs[serverId], pugChannel = _state$pugs$serverId2.pugChannel, list = _state$pugs$serverId2.list;

            if (!(pugChannel !== channel.id)) {
              _context4.next = 6;
              break;
            }

            return _context4.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "not present", " <#").concat(pugChannel, ">")));

          case 6:
            channel.send((0, _formats.formatListAllCurrentGameTypes)(list, channel.guild.name));
            _context4.next = 13;
            break;

          case 9:
            _context4.prev = 9;
            _context4.t0 = _context4["catch"](1);
            channel.send('Something went wrong');
            console.log(_context4.t0);

          case 13:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[1, 9]]);
  }));

  return function listAllCurrentGameTypes(_x13, _x14, _x15, _x16) {
    return _ref15.apply(this, arguments);
  };
}();

exports.listAllCurrentGameTypes = listAllCurrentGameTypes;

var joinGameTypes =
/*#__PURE__*/
function () {
  var _ref18 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5(_ref16, args, serverId, _ref17) {
    var channel, id, username, roles, isInvisible, state, _state$pugs$serverId3, pugChannel, list, gameTypes, isPartOfFilledPug, db_user, toBroadcast, user, statuses, allLeaveMsgs, i, op, allPugLeaveMsgs, j, player, msg;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            channel = _ref16.channel;
            id = _ref17.id, username = _ref17.username, roles = _ref17.roles, isInvisible = _ref17.isInvisible;
            _context5.prev = 2;
            state = _store["default"].getState();
            _state$pugs$serverId3 = state.pugs[serverId], pugChannel = _state$pugs$serverId3.pugChannel, list = _state$pugs$serverId3.list, gameTypes = _state$pugs$serverId3.gameTypes;

            if (!(pugChannel !== channel.id)) {
              _context5.next = 7;
              break;
            }

            return _context5.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "not present", " <#").concat(pugChannel, ">")));

          case 7:
            if (!isInvisible) {
              _context5.next = 9;
              break;
            }

            return _context5.abrupt("return", channel.send("Cannot use this command while invisible"));

          case 9:
            if (id) {
              _context5.next = 11;
              break;
            }

            return _context5.abrupt("return", channel.send('No user was mentioned'));

          case 11:
            isPartOfFilledPug = list.find(function (p) {
              return p.picking && p.players.some(function (u) {
                return u.id === id;
              });
            });

            if (!isPartOfFilledPug) {
              _context5.next = 14;
              break;
            }

            return _context5.abrupt("return", channel.send("Please leave **".concat(isPartOfFilledPug.name.toUpperCase(), "** first to join other pugs")));

          case 14:
            _context5.next = 16;
            return _models.Users.findOne({
              server_id: serverId,
              id: id
            }).exec();

          case 16:
            db_user = _context5.sent;
            toBroadcast = null;
            user = {
              id: id,
              username: username,
              stats: db_user ? db_user.stats : {}
            };
            statuses = args.map(function (a) {
              if (!toBroadcast) {
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
                var hasFilledBeforeJoining = pug.picking;
                var joined = pug.addPlayer(user);
                pug.players.length === pug.noOfPlayers ? pug.fillPug(serverId) : null;
                var hasFilledAfterJoining = pug.picking;

                if (!hasFilledBeforeJoining && hasFilledAfterJoining) {
                  toBroadcast = pug;
                }

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
              }
            });
            channel.send((0, _formats.formatJoinStatus)(statuses.filter(Boolean)));

            if (!toBroadcast) {
              _context5.next = 45;
              break;
            }

            allLeaveMsgs = "";
            i = 0;

          case 24:
            if (!(i < list.length)) {
              _context5.next = 43;
              break;
            }

            op = list[i];

            if (!(op.name !== toBroadcast.name)) {
              _context5.next = 40;
              break;
            }

            allPugLeaveMsgs = "";
            j = 0;

          case 29:
            if (!(j < toBroadcast.players.length)) {
              _context5.next = 39;
              break;
            }

            player = toBroadcast.players[j];

            if (!op.findPlayer(player)) {
              _context5.next = 36;
              break;
            }

            _context5.next = 34;
            return leaveGameTypes({
              channel: channel
            }, [op.name], serverId, player, null, true);

          case 34:
            msg = _context5.sent;
            allPugLeaveMsgs += "".concat(msg, " ");

          case 36:
            j++;
            _context5.next = 29;
            break;

          case 39:
            allLeaveMsgs += "".concat(allPugLeaveMsgs, " \n");

          case 40:
            i++;
            _context5.next = 24;
            break;

          case 43:
            allLeaveMsgs && channel.send(allLeaveMsgs);
            channel.send((0, _formats.formatBroadcastPug)(toBroadcast));

          case 45:
            _context5.next = 51;
            break;

          case 47:
            _context5.prev = 47;
            _context5.t0 = _context5["catch"](2);
            channel.send('Something went wrong');
            console.log(_context5.t0);

          case 51:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[2, 47]]);
  }));

  return function joinGameTypes(_x17, _x18, _x19, _x20) {
    return _ref18.apply(this, arguments);
  };
}();

exports.joinGameTypes = joinGameTypes;

var leaveGameTypes =
/*#__PURE__*/
function () {
  var _ref21 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6(_ref19, args, serverId, _ref20, isOffline, returnStatus) {
    var channel, id, username, roles, state, _state$pugs$serverId4, pugChannel, list, gameTypes, user, statuses, deadPugs, leaveStatus;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            channel = _ref19.channel;
            id = _ref20.id, username = _ref20.username, roles = _ref20.roles;
            _context6.prev = 2;
            state = _store["default"].getState();
            _state$pugs$serverId4 = state.pugs[serverId], pugChannel = _state$pugs$serverId4.pugChannel, list = _state$pugs$serverId4.list, gameTypes = _state$pugs$serverId4.gameTypes;

            if (!(pugChannel !== channel.id)) {
              _context6.next = 7;
              break;
            }

            return _context6.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "not present", " <#").concat(pugChannel, ">")));

          case 7:
            if (id) {
              _context6.next = 9;
              break;
            }

            return _context6.abrupt("return", channel.send('No user was mentioned'));

          case 9:
            if (!(args.length === 0)) {
              _context6.next = 11;
              break;
            }

            return _context6.abrupt("return", channel.send('Invalid, No pugs were mentioned'));

          case 11:
            user = {
              id: id,
              username: username
            };
            statuses = args.map(function (a) {
              var game = a.toLowerCase();
              var gameType = gameTypes.find(function (g) {
                return g.name === game;
              });
              if (!gameType) return {
                user: user,
                name: game,
                left: -1
              }; // -1 is for NOT FOUND

              var pug = list.find(function (p) {
                return p.name === game;
              });
              var isInPug = pug && pug.findPlayer(user);

              if (isInPug) {
                pug.removePlayer(user);
                return {
                  user: user,
                  pug: pug,
                  name: game,
                  left: 1,
                  activeCount: pug.players.length,
                  maxPlayers: pug.noOfPlayers
                };
              }

              return {
                user: user,
                name: game,
                left: 0
              };
            }); // TODO Compute deadpugs

            deadPugs = statuses.reduce(function (acc, _ref22) {
              var user = _ref22.user,
                  pug = _ref22.pug,
                  name = _ref22.name,
                  activeCount = _ref22.activeCount,
                  maxPlayers = _ref22.maxPlayers;

              if (activeCount === maxPlayers - 1) {
                acc.push({
                  pug: pug,
                  user: user
                });
              }

              if (pug && pug.isEmpty()) {
                _store["default"].dispatch((0, _actions.removePug)({
                  serverId: serverId,
                  name: name
                }));
              }

              return acc;
            }, []);
            leaveStatus = (0, _formats.formatLeaveStatus)(statuses, isOffline);

            if (!returnStatus) {
              _context6.next = 17;
              break;
            }

            return _context6.abrupt("return", leaveStatus);

          case 17:
            channel.send(leaveStatus);
            deadPugs.length > 0 ? channel.send((0, _formats.formatDeadPugs)(deadPugs)) : null;
            _context6.next = 25;
            break;

          case 21:
            _context6.prev = 21;
            _context6.t0 = _context6["catch"](2);
            channel.send('Something went wrong');
            console.log(_context6.t0);

          case 25:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[2, 21]]);
  }));

  return function leaveGameTypes(_x21, _x22, _x23, _x24, _x25, _x26) {
    return _ref21.apply(this, arguments);
  };
}();

exports.leaveGameTypes = leaveGameTypes;

var leaveAllGameTypes =
/*#__PURE__*/
function () {
  var _ref23 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee7(message, args, serverId, user) {
    var state, _state$pugs$serverId5, pugChannel, list, hasGoneOffline, listToLeave;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            state = _store["default"].getState();
            _state$pugs$serverId5 = state.pugs[serverId], pugChannel = _state$pugs$serverId5.pugChannel, list = _state$pugs$serverId5.list;

            if (!(pugChannel !== message.channel.id)) {
              _context7.next = 5;
              break;
            }

            return _context7.abrupt("return", message.channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "not present", " <#").concat(pugChannel, ">")));

          case 5:
            hasGoneOffline = args[0] === _constants.offline;
            listToLeave = list.reduce(function (acc, pug) {
              var isInPug = pug.findPlayer(user);

              if (isInPug) {
                acc.push(pug.name);
              }

              return acc;
            }, []);

            if (!(listToLeave.length === 0)) {
              _context7.next = 9;
              break;
            }

            return _context7.abrupt("return", channel.send("Cannot leave pug(s) if you haven't joined any :head_bandage:"));

          case 9:
            leaveGameTypes(message, listToLeave, serverId, user, hasGoneOffline);
            _context7.next = 16;
            break;

          case 12:
            _context7.prev = 12;
            _context7.t0 = _context7["catch"](0);
            message.channel.send('Something went wrong');
            console.log(_context7.t0);

          case 16:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[0, 12]]);
  }));

  return function leaveAllGameTypes(_x27, _x28, _x29, _x30) {
    return _ref23.apply(this, arguments);
  };
}();

exports.leaveAllGameTypes = leaveAllGameTypes;

var addCaptain =
/*#__PURE__*/
function () {
  var _ref26 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee8(_ref24, args, serverId, _ref25) {
    var channel, id, username, roles, state, _state$pugs$serverId6, pugChannel, list, forWhichPug, user, result;

    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            channel = _ref24.channel;
            id = _ref25.id, username = _ref25.username, roles = _ref25.roles;
            _context8.prev = 2;
            state = _store["default"].getState();
            _state$pugs$serverId6 = state.pugs[serverId], pugChannel = _state$pugs$serverId6.pugChannel, list = _state$pugs$serverId6.list;

            if (!(pugChannel !== channel.id)) {
              _context8.next = 7;
              break;
            }

            return _context8.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "not present", " <#").concat(pugChannel, ">")));

          case 7:
            forWhichPug = list.find(function (pug) {
              var isCandidate = pug.picking && !pug.areCaptainsDecided();

              if (isCandidate) {
                return pug.players.some(function (u) {
                  return u.id === id;
                }); // check whether the guy is present there
              }

              return false;
            });

            if (forWhichPug) {
              _context8.next = 10;
              break;
            }

            return _context8.abrupt("return", channel.send('There was no filled pug for howMany you could captain'));

          case 10:
            if (forWhichPug.players.some(function (u) {
              return u.id === id && u.captain === null;
            })) {
              _context8.next = 12;
              break;
            }

            return _context8.abrupt("return", channel.send("**".concat(username, "** is already a captain")));

          case 12:
            user = {
              id: id,
              username: username
            };
            result = forWhichPug.addCaptain(user);
            channel.send((0, _formats.formatAddCaptainStatus)(user, result)); // TODO Broadcast captains decided

            if (result.captainsDecided) {
              // emit
              pugEventEmitter.emit(_constants.pugEvents.captainsReady, serverId, forWhichPug.name);
            }

            _context8.next = 22;
            break;

          case 18:
            _context8.prev = 18;
            _context8.t0 = _context8["catch"](2);
            channel.send('Something went wrong');
            console.log(_context8.t0);

          case 22:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[2, 18]]);
  }));

  return function addCaptain(_x31, _x32, _x33, _x34) {
    return _ref26.apply(this, arguments);
  };
}();

exports.addCaptain = addCaptain;

var pickPlayer =
/*#__PURE__*/
function () {
  var _ref30 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee9(_ref27, _ref28, serverId, _ref29) {
    var channel, _ref31, index, args, id, username, roles, state, _state$pugs$serverId7, pugChannel, list, playerIndex, forWhichPug, _forWhichPug$players$, team, pickingOrder, turn, name, alreadyPicked, result, players;

    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            channel = _ref27.channel;
            _ref31 = _toArray(_ref28), index = _ref31[0], args = _ref31.slice(1);
            id = _ref29.id, username = _ref29.username, roles = _ref29.roles;
            _context9.prev = 3;
            state = _store["default"].getState();
            _state$pugs$serverId7 = state.pugs[serverId], pugChannel = _state$pugs$serverId7.pugChannel, list = _state$pugs$serverId7.list;

            if (!(pugChannel !== channel.id)) {
              _context9.next = 8;
              break;
            }

            return _context9.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "not present", " <#").concat(pugChannel, ">")));

          case 8:
            playerIndex = parseInt(index);

            if (playerIndex) {
              _context9.next = 11;
              break;
            }

            return _context9.abrupt("return");

          case 11:
            forWhichPug = list.find(function (pug) {
              if (pug.picking) {
                return pug.players.some(function (u) {
                  return u.id === id && u.captain !== null;
                }); // check whether the guy is present there
              }

              return false;
            });

            if (forWhichPug) {
              _context9.next = 14;
              break;
            }

            return _context9.abrupt("return", channel.send('Cannot pick if you are not a captain in a pug :head_bandage: '));

          case 14:
            if (forWhichPug.areCaptainsDecided()) {
              _context9.next = 16;
              break;
            }

            return _context9.abrupt("return", channel.send('Please wait until all captains have been decided'));

          case 16:
            _forWhichPug$players$ = forWhichPug.players.find(function (u) {
              return u.id === id & u.captain !== null;
            }), team = _forWhichPug$players$.team;
            pickingOrder = forWhichPug.pickingOrder, turn = forWhichPug.turn, name = forWhichPug.name;

            if (!(team !== pickingOrder[turn])) {
              _context9.next = 20;
              break;
            }

            return _context9.abrupt("return", channel.send('Please wait for your turn :pouting_cat: '));

          case 20:
            if (!(playerIndex < 1 || playerIndex > forWhichPug.players.length)) {
              _context9.next = 22;
              break;
            }

            return _context9.abrupt("return", channel.send('Invalid pick'));

          case 22:
            if (!(forWhichPug.players[playerIndex - 1].team !== null)) {
              _context9.next = 25;
              break;
            }

            alreadyPicked = forWhichPug.players[playerIndex - 1];
            return _context9.abrupt("return", channel.send("".concat(alreadyPicked.username, " is already picked")));

          case 25:
            result = forWhichPug.pickPlayer(playerIndex - 1, pickingOrder[turn]);
            channel.send((0, _formats.formatPickPlayerStatus)(_objectSpread({}, result, {
              pug: forWhichPug
            }))); // TODO If finished, save stats to DB and remove from redux

            if (result.finished) {
              new _models.Pugs({
                server_id: serverId,
                name: forWhichPug.name,
                pug: forWhichPug,
                timestamp: new Date()
              }).save();
              players = forWhichPug.players;
              players.forEach(function (_ref32) {
                var id = _ref32.id,
                    username = _ref32.username,
                    pick = _ref32.pick,
                    captain = _ref32.captain,
                    stats = _ref32.stats;
                var updatedStats = {};
                var existingStats = stats[forWhichPug.name];

                if (!existingStats) {
                  updatedStats = {
                    totalRating: pick,
                    totalCaptain: captain ? 1 : 0,
                    totalPugs: 1
                  };
                } else {
                  updatedStats = {
                    totalRating: captain ? existingStats.totalRating : (existingStats.totalRating + pick) / 2,
                    totalCaptain: captain ? existingStats.totalCaptain + 1 : existingStats.totalCaptain,
                    totalPugs: existingStats.totalPugs + 1
                  };
                }

                _models.Users.findOneAndUpdate({
                  id: id,
                  server_id: serverId
                }, {
                  $set: {
                    username: username,
                    last_pug: _objectSpread({}, forWhichPug, {
                      timestamp: new Date()
                    }),
                    stats: _objectSpread({}, stats, _defineProperty({}, forWhichPug.name, updatedStats))
                  }
                }, {
                  upsert: true
                }).exec();
              });

              _store["default"].dispatch((0, _actions.removePug)({
                serverId: serverId,
                name: name
              }));
            }

            _context9.next = 34;
            break;

          case 30:
            _context9.prev = 30;
            _context9.t0 = _context9["catch"](3);
            channel.send('Something went wrong');
            console.log(_context9.t0);

          case 34:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[3, 30]]);
  }));

  return function pickPlayer(_x35, _x36, _x37, _x38) {
    return _ref30.apply(this, arguments);
  };
}();

exports.pickPlayer = pickPlayer;

var pugPicking =
/*#__PURE__*/
function () {
  var _ref34 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee10(_ref33, _, serverId, __) {
    var channel, state, _state$pugs$serverId8, pugChannel, list, pugsInPicking;

    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            channel = _ref33.channel;
            _context10.prev = 1;
            state = _store["default"].getState();
            _state$pugs$serverId8 = state.pugs[serverId], pugChannel = _state$pugs$serverId8.pugChannel, list = _state$pugs$serverId8.list;

            if (!(pugChannel !== channel.id)) {
              _context10.next = 6;
              break;
            }

            return _context10.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "not present", " <#").concat(pugChannel, ">")));

          case 6:
            pugsInPicking = list.filter(function (pug) {
              return pug.picking && pug.areCaptainsDecided();
            });

            if (!(pugsInPicking.length === 0)) {
              _context10.next = 9;
              break;
            }

            return _context10.abrupt("return", channel.send('There are no pugs in picking mode'));

          case 9:
            channel.send((0, _formats.formatPugsInPicking)(pugsInPicking));
            _context10.next = 16;
            break;

          case 12:
            _context10.prev = 12;
            _context10.t0 = _context10["catch"](1);
            channel.send('Something went wrong');
            console.log(_context10.t0);

          case 16:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[1, 12]]);
  }));

  return function pugPicking(_x39, _x40, _x41, _x42) {
    return _ref34.apply(this, arguments);
  };
}();

exports.pugPicking = pugPicking;

var promoteAvailablePugs =
/*#__PURE__*/
function () {
  var _ref36 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee11(_ref35, args, serverId, _) {
    var channel, state, _state$pugs$serverId9, pugChannel, list, hasPugMentioned;

    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            channel = _ref35.channel;
            _context11.prev = 1;
            state = _store["default"].getState();
            _state$pugs$serverId9 = state.pugs[serverId], pugChannel = _state$pugs$serverId9.pugChannel, list = _state$pugs$serverId9.list;

            if (!(pugChannel !== channel.id)) {
              _context11.next = 6;
              break;
            }

            return _context11.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "not present", " <#").concat(pugChannel, ">")));

          case 6:
            hasPugMentioned = args[0] && list.find(function (p) {
              return p.name === args[0].toLowerCase();
            });

            if (!(hasPugMentioned && hasPugMentioned.players.length > 0)) {
              _context11.next = 9;
              break;
            }

            return _context11.abrupt("return", channel.send((0, _formats.formatPromoteAvailablePugs)([hasPugMentioned], channel.guild.name)));

          case 9:
            !hasPugMentioned && list.length > 0 ? channel.send((0, _formats.formatPromoteAvailablePugs)(list, channel.guild.name)) : channel.send('There are no active pugs to promote. Try joining one!');
            _context11.next = 16;
            break;

          case 12:
            _context11.prev = 12;
            _context11.t0 = _context11["catch"](1);
            channel.send('Something went wrong');
            console.log(_context11.t0);

          case 16:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, null, [[1, 12]]);
  }));

  return function promoteAvailablePugs(_x43, _x44, _x45, _x46) {
    return _ref36.apply(this, arguments);
  };
}();

exports.promoteAvailablePugs = promoteAvailablePugs;

var checkLastPugs =
/*#__PURE__*/
function () {
  var _ref39 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee12(_ref37, args, serverId, _ref38) {
    var channel, action, state, _state$pugs$serverId10, pugChannel, list, gameTypes, howMany, pugArg, results, _results$filter, _results$filter2, found;

    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            channel = _ref37.channel;
            action = _ref38.action;
            _context12.prev = 2;
            state = _store["default"].getState();
            _state$pugs$serverId10 = state.pugs[serverId], pugChannel = _state$pugs$serverId10.pugChannel, list = _state$pugs$serverId10.list, gameTypes = _state$pugs$serverId10.gameTypes;

            if (!(pugChannel !== channel.id)) {
              _context12.next = 7;
              break;
            }

            return _context12.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "not present", " <#").concat(pugChannel, ">")));

          case 7:
            howMany = action.split('').reduce(function (acc, curr) {
              return acc += curr === 't' ? 1 : 0;
            }, 0);
            pugArg = args[0] && args[0].toLowerCase();
            results = null;

            if (!pugArg) {
              _context12.next = 16;
              break;
            }

            _context12.next = 13;
            return _models.Pugs.find({
              server_id: serverId,
              name: pugArg
            }).sort({
              timestamp: -1
            }).limit(howMany).exec();

          case 13:
            results = _context12.sent;
            _context12.next = 19;
            break;

          case 16:
            _context12.next = 18;
            return _models.Pugs.find({
              server_id: serverId
            }).sort({
              timestamp: -1
            }).limit(howMany).exec();

          case 18:
            results = _context12.sent;

          case 19:
            if (!(!results || results.length === 0)) {
              _context12.next = 21;
              break;
            }

            return _context12.abrupt("return", channel.send("No ".concat(action, " pug found ").concat(pugArg ? "for **".concat(pugArg.toUpperCase(), "**") : "not present")));

          case 21:
            _results$filter = results.filter(function (_, i) {
              return i === howMany - 1;
            }), _results$filter2 = _slicedToArray(_results$filter, 1), found = _results$filter2[0];
            found && channel.send((0, _formats.formatLastPugStatus)({
              pug: found.pug,
              guildName: channel.guild.name
            }, action, found.timestamp));
            _context12.next = 29;
            break;

          case 25:
            _context12.prev = 25;
            _context12.t0 = _context12["catch"](2);
            channel.send('Something went wrong');
            console.log(_context12.t0);

          case 29:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, null, [[2, 25]]);
  }));

  return function checkLastPugs(_x47, _x48, _x49, _x50) {
    return _ref39.apply(this, arguments);
  };
}();

exports.checkLastPugs = checkLastPugs;

var resetPug =
/*#__PURE__*/
function () {
  var _ref42 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee13(_ref40, args, serverId, _ref41) {
    var channel, roles, state, _state$pugs$serverId11, pugChannel, list, pugName, forWhichPug;

    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            channel = _ref40.channel;
            roles = _ref41.roles;

            if ((0, _utils.hasPrivilegedRole)(_constants.privilegedRoles, roles)) {
              _context13.next = 4;
              break;
            }

            return _context13.abrupt("return");

          case 4:
            state = _store["default"].getState();
            _state$pugs$serverId11 = state.pugs[serverId], pugChannel = _state$pugs$serverId11.pugChannel, list = _state$pugs$serverId11.list;

            if (!(pugChannel !== channel.id)) {
              _context13.next = 8;
              break;
            }

            return _context13.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "not present", " <#").concat(pugChannel, ">")));

          case 8:
            pugName = args[0].toLowerCase();
            forWhichPug = list.find(function (p) {
              return p.name === pugName;
            });

            if (forWhichPug) {
              _context13.next = 12;
              break;
            }

            return _context13.abrupt("return", channel.send("No pug found: **".concat(args[0].toUpperCase(), "**")));

          case 12:
            if (forWhichPug.picking) {
              _context13.next = 14;
              break;
            }

            return _context13.abrupt("return", channel.send("**".concat(forWhichPug.name.toUpperCase(), "** is not in picking mode yet")));

          case 14:
            forWhichPug.resetPug(serverId);
            channel.send((0, _formats.formatBroadcastPug)(forWhichPug));

          case 16:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));

  return function resetPug(_x51, _x52, _x53, _x54) {
    return _ref42.apply(this, arguments);
  };
}();

exports.resetPug = resetPug;

var decidePromoteOrPick =
/*#__PURE__*/
function () {
  var _ref45 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee14(_ref43, args, serverId, _ref44) {
    var channel, id, username, action, state, _state$pugs$serverId12, pugChannel, list;

    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            channel = _ref43.channel;
            id = _ref44.id, username = _ref44.username, action = _ref44.action;
            _context14.prev = 2;
            state = _store["default"].getState();
            _state$pugs$serverId12 = state.pugs[serverId], pugChannel = _state$pugs$serverId12.pugChannel, list = _state$pugs$serverId12.list;

            if (!(pugChannel !== channel.id)) {
              _context14.next = 7;
              break;
            }

            return _context14.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "not present", " <#").concat(pugChannel, ">")));

          case 7:
            if (!(['p', 'promote'].includes(action) && !args[0])) {
              _context14.next = 9;
              break;
            }

            return _context14.abrupt("return", promoteAvailablePugs({
              channel: channel
            }, args, serverId, {
              id: id,
              username: username
            }));

          case 9:
            if (!(['p', 'pick'].includes(action) && args[0])) {
              _context14.next = 17;
              break;
            }

            if (!(action === 'p')) {
              _context14.next = 16;
              break;
            }

            if (!isNaN(args[0])) {
              _context14.next = 13;
              break;
            }

            return _context14.abrupt("return", promoteAvailablePugs({
              channel: channel
            }, args, serverId, {
              id: id,
              username: username
            }));

          case 13:
            return _context14.abrupt("return", pickPlayer({
              channel: channel
            }, args, serverId, {
              id: id,
              username: username
            }));

          case 16:
            return _context14.abrupt("return", pickPlayer({
              channel: channel
            }, args, serverId, {
              id: id,
              username: username
            }));

          case 17:
            _context14.next = 23;
            break;

          case 19:
            _context14.prev = 19;
            _context14.t0 = _context14["catch"](2);
            channel.send('Something went wrong');
            console.log(_context14.t0);

          case 23:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14, null, [[2, 19]]);
  }));

  return function decidePromoteOrPick(_x55, _x56, _x57, _x58) {
    return _ref45.apply(this, arguments);
  };
}();

exports.decidePromoteOrPick = decidePromoteOrPick;

var checkStats =
/*#__PURE__*/
function () {
  var _ref48 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee15(_ref46, args, serverId, _ref47) {
    var channel, id, username, mentionedUser, state, pugChannel, user;
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            channel = _ref46.channel;
            id = _ref47.id, username = _ref47.username, mentionedUser = _ref47.mentionedUser;
            _context15.prev = 2;
            state = _store["default"].getState();
            pugChannel = state.pugs[serverId].pugChannel;

            if (!(pugChannel !== channel.id)) {
              _context15.next = 7;
              break;
            }

            return _context15.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "not present", " <#").concat(pugChannel, ">")));

          case 7:
            _context15.next = 9;
            return _models.Users.findOne({
              server_id: serverId,
              id: mentionedUser ? mentionedUser.id : id
            });

          case 9:
            user = _context15.sent;

            if (user) {
              _context15.next = 12;
              break;
            }

            return _context15.abrupt("return", channel.send("There are no stats logged for **".concat(mentionedUser ? mentionedUser.username : username, "**")));

          case 12:
            channel.send((0, _formats.formatUserStats)(user));
            _context15.next = 19;
            break;

          case 15:
            _context15.prev = 15;
            _context15.t0 = _context15["catch"](2);
            channel.send('Something went wrong');
            console.log(_context15.t0);

          case 19:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15, null, [[2, 15]]);
  }));

  return function checkStats(_x59, _x60, _x61, _x62) {
    return _ref48.apply(this, arguments);
  };
}();

exports.checkStats = checkStats;

var addOrRemoveTag =
/*#__PURE__*/
function () {
  var _ref51 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee16(_ref49, args, serverId, _ref50) {
    var channel, id, username, state, _state$pugs$serverId13, pugChannel, list, tag, isAddingTag, whichPugs;

    return regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            channel = _ref49.channel;
            id = _ref50.id, username = _ref50.username;
            _context16.prev = 2;
            state = _store["default"].getState();
            _state$pugs$serverId13 = state.pugs[serverId], pugChannel = _state$pugs$serverId13.pugChannel, list = _state$pugs$serverId13.list;

            if (!(pugChannel !== channel.id)) {
              _context16.next = 7;
              break;
            }

            return _context16.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "not present", " <#").concat(pugChannel, ">")));

          case 7:
            tag = '';
            isAddingTag = Boolean(args[0]);

            if (!(isAddingTag && args.join(' ').length > _constants.tagLength)) {
              _context16.next = 11;
              break;
            }

            return _context16.abrupt("return", channel.send("Tags must be shorter than ".concat(_constants.tagLength, " characters")));

          case 11:
            tag = (0, _utils.sanitizeName)(args.join(' '));
            whichPugs = list.filter(function (pug) {
              return pug.findPlayer({
                id: id,
                username: username
              });
            });

            if (!(whichPugs.length === 0)) {
              _context16.next = 15;
              break;
            }

            return _context16.abrupt("return");

          case 15:
            whichPugs.forEach(function (pug) {
              isAddingTag ? pug.addTag({
                id: id,
                username: username
              }, tag) : pug.removeTag({
                id: id,
                username: username
              });
            });
            isAddingTag ? channel.send("Your new tag is: **".concat(tag, "**")) : channel.send("Your tag has been removed");
            _context16.next = 23;
            break;

          case 19:
            _context16.prev = 19;
            _context16.t0 = _context16["catch"](2);
            channel.send('Something went wrong');
            console.log(_context16.t0);

          case 23:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16, null, [[2, 19]]);
  }));

  return function addOrRemoveTag(_x63, _x64, _x65, _x66) {
    return _ref51.apply(this, arguments);
  };
}();
/**
 * A D M I N
 * C O M M A N D S
 */


exports.addOrRemoveTag = addOrRemoveTag;

var adminAddPlayer =
/*#__PURE__*/
function () {
  var _ref54 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee17(_ref52, args, serverId, _ref53) {
    var channel, mentionedUser, roles, state, pugChannel;
    return regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            channel = _ref52.channel;
            mentionedUser = _ref53.mentionedUser, roles = _ref53.roles;
            _context17.prev = 2;
            state = _store["default"].getState();
            pugChannel = state.pugs[serverId].pugChannel;

            if (!(pugChannel !== channel.id)) {
              _context17.next = 7;
              break;
            }

            return _context17.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "", " <#").concat(pugChannel, ">")));

          case 7:
            if ((0, _utils.hasPrivilegedRole)(_constants.privilegedRoles, roles)) {
              _context17.next = 9;
              break;
            }

            return _context17.abrupt("return");

          case 9:
            if (mentionedUser) {
              _context17.next = 11;
              break;
            }

            return _context17.abrupt("return", channel.send('No mentioned user'));

          case 11:
            joinGameTypes({
              channel: channel
            }, args.slice(1), serverId, {
              id: mentionedUser.id,
              username: mentionedUser.username
            });
            _context17.next = 18;
            break;

          case 14:
            _context17.prev = 14;
            _context17.t0 = _context17["catch"](2);
            channel.send('Something went wrong');
            console.log(_context17.t0);

          case 18:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17, null, [[2, 14]]);
  }));

  return function adminAddPlayer(_x67, _x68, _x69, _x70) {
    return _ref54.apply(this, arguments);
  };
}();

exports.adminAddPlayer = adminAddPlayer;

var adminRemovePlayer =
/*#__PURE__*/
function () {
  var _ref57 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee18(_ref55, args, serverId, _ref56) {
    var channel, mentionedUser, roles, state, pugChannel;
    return regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            channel = _ref55.channel;
            mentionedUser = _ref56.mentionedUser, roles = _ref56.roles;
            _context18.prev = 2;
            state = _store["default"].getState();
            pugChannel = state.pugs[serverId].pugChannel;

            if (!(pugChannel !== channel.id)) {
              _context18.next = 7;
              break;
            }

            return _context18.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "", " <#").concat(pugChannel, ">")));

          case 7:
            if ((0, _utils.hasPrivilegedRole)(_constants.privilegedRoles, roles)) {
              _context18.next = 9;
              break;
            }

            return _context18.abrupt("return");

          case 9:
            if (mentionedUser) {
              _context18.next = 11;
              break;
            }

            return _context18.abrupt("return", channel.send('No mentioned user'));

          case 11:
            leaveGameTypes({
              channel: channel
            }, args.slice(1), serverId, {
              id: mentionedUser.id,
              username: mentionedUser.username
            });
            _context18.next = 18;
            break;

          case 14:
            _context18.prev = 14;
            _context18.t0 = _context18["catch"](2);
            channel.send('Something went wrong');
            console.log(_context18.t0);

          case 18:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18, null, [[2, 14]]);
  }));

  return function adminRemovePlayer(_x71, _x72, _x73, _x74) {
    return _ref57.apply(this, arguments);
  };
}();

exports.adminRemovePlayer = adminRemovePlayer;

var adminPickPlayer =
/*#__PURE__*/
function () {
  var _ref60 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee19(_ref58, args, serverId, _ref59) {
    var channel, mentionedUser, roles, state, pugChannel;
    return regeneratorRuntime.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            channel = _ref58.channel;
            mentionedUser = _ref59.mentionedUser, roles = _ref59.roles;
            _context19.prev = 2;
            state = _store["default"].getState();
            pugChannel = state.pugs[serverId].pugChannel;

            if (!(pugChannel !== channel.id)) {
              _context19.next = 7;
              break;
            }

            return _context19.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "", " <#").concat(pugChannel, ">")));

          case 7:
            if ((0, _utils.hasPrivilegedRole)(_constants.privilegedRoles, roles)) {
              _context19.next = 9;
              break;
            }

            return _context19.abrupt("return");

          case 9:
            if (mentionedUser) {
              _context19.next = 11;
              break;
            }

            return _context19.abrupt("return", channel.send('No mentioned user'));

          case 11:
            pickPlayer({
              channel: channel
            }, args.slice(1), serverId, {
              id: mentionedUser.id,
              username: mentionedUser.username
            });
            _context19.next = 18;
            break;

          case 14:
            _context19.prev = 14;
            _context19.t0 = _context19["catch"](2);
            channel.send('Something went wrong');
            console.log(_context19.t0);

          case 18:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19, null, [[2, 14]]);
  }));

  return function adminPickPlayer(_x75, _x76, _x77, _x78) {
    return _ref60.apply(this, arguments);
  };
}();

exports.adminPickPlayer = adminPickPlayer;

var blockPlayer =
/*#__PURE__*/
function () {
  var _ref63 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee20(_ref61, args, serverId, _ref62) {
    var channel, id, username, roles, mentionedUser, state, _state$pugs$serverId14, pugChannel, pugList, list, _args$slice, _args$slice2, timeframe, reason, _timeframe$match, _timeframe$match2, blockLengthString, _timeframe$match3, _timeframe$match4, blockPeriodString, blockCalculator, blockLength, expirationDate, newBlockedUser, blockedMsg, i;

    return regeneratorRuntime.wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            channel = _ref61.channel;
            id = _ref62.id, username = _ref62.username, roles = _ref62.roles, mentionedUser = _ref62.mentionedUser;
            _context20.prev = 2;
            state = _store["default"].getState();
            _state$pugs$serverId14 = state.pugs[serverId], pugChannel = _state$pugs$serverId14.pugChannel, pugList = _state$pugs$serverId14.list;
            list = state.blocks[serverId].list;

            if (!(pugChannel !== channel.id)) {
              _context20.next = 8;
              break;
            }

            return _context20.abrupt("return", channel.send("Active channel for pugs is ".concat(pugChannel ? "<#".concat(pugChannel, ">") : "", " <#").concat(pugChannel, ">")));

          case 8:
            if ((0, _utils.hasPrivilegedRole)(_constants.privilegedRoles, roles)) {
              _context20.next = 10;
              break;
            }

            return _context20.abrupt("return");

          case 10:
            if (mentionedUser) {
              _context20.next = 12;
              break;
            }

            return _context20.abrupt("return", channel.send('No mentioned user'));

          case 12:
            if (!list.some(function (u) {
              return u.id === mentionedUser.id;
            })) {
              _context20.next = 14;
              break;
            }

            return _context20.abrupt("return", channel.send("".concat(mentionedUser.username, " is already blocked from pugs")));

          case 14:
            _args$slice = args.slice(1), _args$slice2 = _toArray(_args$slice), timeframe = _args$slice2[0], reason = _args$slice2.slice(1);
            _timeframe$match = timeframe.match(/[0-9]+/g), _timeframe$match2 = _slicedToArray(_timeframe$match, 1), blockLengthString = _timeframe$match2[0];
            _timeframe$match3 = timeframe.match(/[m|h|d]/g), _timeframe$match4 = _slicedToArray(_timeframe$match3, 1), blockPeriodString = _timeframe$match4[0];

            if (!(!blockLengthString || !blockPeriodString)) {
              _context20.next = 19;
              break;
            }

            return _context20.abrupt("return");

          case 19:
            blockCalculator = {
              m: function m(minutes) {
                var dt = new Date();
                dt.setMinutes(dt.getMinutes() + minutes);
                return dt;
              },
              h: function h(hours) {
                var dt = new Date();
                dt.setHours(dt.getHours() + hours);
                return dt;
              },
              d: function d(days) {
                var dt = new Date();
                dt.setHours(dt.getHours() + days * 24);
                return dt;
              }
            };
            blockLength = parseInt(blockLengthString);

            if (!(blockLength < 0)) {
              _context20.next = 23;
              break;
            }

            return _context20.abrupt("return");

          case 23:
            expirationDate = blockCalculator[blockPeriodString](blockLength);
            newBlockedUser = {
              id: mentionedUser.id,
              username: mentionedUser.username,
              blocked_on: new Date(),
              expires_at: expirationDate,
              reason: reason.join(' ') || ''
            };
            _context20.next = 27;
            return _models.Blocks.findOneAndUpdate({
              server_id: serverId
            }, {
              $set: {
                blocked_users: newBlockedUser
              }
            }, {
              upsert: true
            });

          case 27:
            _store["default"].dispatch((0, _actions.addBlock)({
              serverId: serverId,
              blockedUser: newBlockedUser
            })); // remove from pugs if joined


            blockedMsg = "**".concat(mentionedUser.username, "** was removed from ");
            i = 0;

          case 30:
            if (!(i < pugList.length)) {
              _context20.next = 38;
              break;
            }

            if (!pugList[i].findPlayer({
              id: mentionedUser.id
            })) {
              _context20.next = 35;
              break;
            }

            _context20.next = 34;
            return leaveGameTypes({
              channel: channel
            }, [pugList[i].name], serverId, {
              id: mentionedUser.id,
              username: mentionedUser.username
            }, null, true);

          case 34:
            blockedMsg += "**".concat(pugList[i].name.toUpperCase(), "** ");

          case 35:
            i++;
            _context20.next = 30;
            break;

          case 38:
            blockedMsg += "because the person got blocked";
            channel.send(blockedMsg);
            _context20.next = 46;
            break;

          case 42:
            _context20.prev = 42;
            _context20.t0 = _context20["catch"](2);
            channel.send('Something went wrong');
            console.log(_context20.t0);

          case 46:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee20, null, [[2, 42]]);
  }));

  return function blockPlayer(_x79, _x80, _x81, _x82) {
    return _ref63.apply(this, arguments);
  };
}();

exports.blockPlayer = blockPlayer;
//# sourceMappingURL=pugHandlers.js.map