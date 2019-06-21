"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.delGameType = exports.addGameType = void 0;

var _store = _interopRequireDefault(require("../store"));

var _models = require("../models");

var _utils = require("../utils");

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

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
    var channel, _ref5, gameName, noOfPlayers, noOfTeams, roles, _ref6, list, pickingOrder, newGameType;

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
            _context.next = 10;
            return _models.GameTypes.findOne({
              server_id: serverId
            }).exec();

          case 10:
            _ref6 = _context.sent;
            list = _ref6.game_types;

            if (!list.some(function (g) {
              return g.name === gameName.toLowerCase();
            })) {
              _context.next = 14;
              break;
            }

            return _context.abrupt("return", channel.send('Gametype already exists'));

          case 14:
            pickingOrder = (0, _utils.computePickingOrder)(parseInt(noOfPlayers), parseInt(noOfTeams));
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
            channel.send("**".concat(gameName, "** has been added"));
            _context.next = 25;
            break;

          case 21:
            _context.prev = 21;
            _context.t0 = _context["catch"](3);
            channel.send('Something went wrong');
            console.log(_context.t0);

          case 25:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 21]]);
  }));

  return function addGameType(_x, _x2, _x3, _x4) {
    return _ref4.apply(this, arguments);
  };
}();

exports.addGameType = addGameType;

var delGameType =
/*#__PURE__*/
function () {
  var _ref10 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(_ref7, _ref8, serverId, _ref9) {
    var channel, _ref11, gameName, rest, roles, _ref12, _ref12$game_types, list, updatedGameTypes;

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
            _context2.next = 8;
            return _models.GameTypes.findOne({
              server_id: serverId
            }).exec();

          case 8:
            _ref12 = _context2.sent;
            _ref12$game_types = _ref12.game_types;
            list = _ref12$game_types === void 0 ? [] : _ref12$game_types;

            if (list.some(function (g) {
              return g.name === gameName.toLowerCase();
            })) {
              _context2.next = 13;
              break;
            }

            return _context2.abrupt("return", channel.send("Gametype doesn't exist"));

          case 13:
            updatedGameTypes = list.filter(function (g) {
              return g.name !== gameName.toLowerCase();
            });
            _context2.next = 16;
            return _models.GameTypes.findOneAndUpdate({
              server_id: serverId
            }, {
              game_types: updatedGameTypes
            }).exec();

          case 16:
            channel.send("**".concat(gameName, "** has been removed"));
            _context2.next = 23;
            break;

          case 19:
            _context2.prev = 19;
            _context2.t0 = _context2["catch"](3);
            channel.send('Something went wrong');
            console.log(_context2.t0);

          case 23:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 19]]);
  }));

  return function delGameType(_x5, _x6, _x7, _x8) {
    return _ref10.apply(this, arguments);
  };
}();

exports.delGameType = delGameType;
//# sourceMappingURL=pugHandlers.js.map