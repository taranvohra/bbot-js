"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryUT99Server = exports.delQueryServer = exports.addQueryServer = exports.servers = void 0;

var _store = _interopRequireDefault(require("../store"));

var _crypto = _interopRequireDefault(require("crypto"));

var _models = require("../models");

var _actions = require("../store/actions");

var _constants = require("../constants");

var _utils = require("../utils");

var _formats = require("../formats");

var _API = _interopRequireDefault(require("../services/API"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var servers =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(_ref, _, serverId, __) {
    var channel, state, _state$queryServers$s, queryChannel, list, sortedList;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            channel = _ref.channel;
            _context.prev = 1;
            state = _store["default"].getState();
            _state$queryServers$s = state.queryServers[serverId], queryChannel = _state$queryServers$s.queryChannel, list = _state$queryServers$s.list;

            if (!(queryChannel !== channel.id)) {
              _context.next = 6;
              break;
            }

            return _context.abrupt("return", channel.send("Active channel for querying is <#".concat(queryChannel, ">")));

          case 6:
            sortedList = list.sort(function (a, b) {
              return a.timestamp - b.timestamp;
            });
            channel.send((0, _formats.formatQueryServers)(sortedList));
            _context.next = 13;
            break;

          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](1);
            console.log(_context.t0);

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 10]]);
  }));

  return function servers(_x, _x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

exports.servers = servers;

var addQueryServer =
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(_ref3, _ref4, serverId, _ref5) {
    var channel, _ref7, hp, rest, roles, state, _state$queryServers$s2, list, _hp$split, _hp$split2, host, port, name, key, newServer;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            channel = _ref3.channel;
            _ref7 = _toArray(_ref4), hp = _ref7[0], rest = _ref7.slice(1);
            roles = _ref5.roles;
            _context2.prev = 3;

            if ((0, _utils.hasPrivilegedRole)(_constants.privilegedRoles, roles)) {
              _context2.next = 6;
              break;
            }

            return _context2.abrupt("return");

          case 6:
            state = _store["default"].getState();
            _state$queryServers$s2 = state.queryServers[serverId].list, list = _state$queryServers$s2 === void 0 ? [] : _state$queryServers$s2;
            _hp$split = hp.split(':'), _hp$split2 = _slicedToArray(_hp$split, 2), host = _hp$split2[0], port = _hp$split2[1];
            name = rest.reduce(function (acc, curr) {
              return acc += curr + ' ';
            }, '');

            if (!(!host || !port || !name)) {
              _context2.next = 12;
              break;
            }

            return _context2.abrupt("return", channel.send('Invalid command'));

          case 12:
            key = _crypto["default"].createHash('sha256').update(hp).digest('hex');
            console.log(key, list);

            if (!list.some(function (s) {
              return s.key === key;
            })) {
              _context2.next = 16;
              break;
            }

            return _context2.abrupt("return", channel.send('Query Server already exists!'));

          case 16:
            newServer = {
              key: key,
              name: name,
              host: host,
              port: port,
              timestamp: Date.now()
            };
            _context2.next = 19;
            return _models.UT99QueryServers.findOneAndUpdate({
              server_id: serverId
            }, {
              $push: {
                query_servers: newServer
              }
            }).exec();

          case 19:
            _store["default"].dispatch((0, _actions.pushQueryServer)({
              serverId: serverId,
              queryServer: newServer
            }));

            channel.send('Query Server added');
            _context2.next = 26;
            break;

          case 23:
            _context2.prev = 23;
            _context2.t0 = _context2["catch"](3);
            console.log(_context2.t0);

          case 26:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 23]]);
  }));

  return function addQueryServer(_x5, _x6, _x7, _x8) {
    return _ref6.apply(this, arguments);
  };
}();

exports.addQueryServer = addQueryServer;

var delQueryServer =
/*#__PURE__*/
function () {
  var _ref11 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(_ref8, _ref9, serverId, _ref10) {
    var channel, _ref12, which, rest, roles, state, _state$queryServers$s3, list, index, sortedList, updatedList;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            channel = _ref8.channel;
            _ref12 = _toArray(_ref9), which = _ref12[0], rest = _ref12.slice(1);
            roles = _ref10.roles;
            _context3.prev = 3;

            if ((0, _utils.hasPrivilegedRole)(_constants.privilegedRoles, roles)) {
              _context3.next = 6;
              break;
            }

            return _context3.abrupt("return");

          case 6:
            state = _store["default"].getState();
            _state$queryServers$s3 = state.queryServers[serverId].list, list = _state$queryServers$s3 === void 0 ? [] : _state$queryServers$s3;
            index = parseInt(which) - 1;
            sortedList = list.sort(function (a, b) {
              return a.timestamp - b.timestamp;
            });

            if (sortedList[index]) {
              _context3.next = 12;
              break;
            }

            return _context3.abrupt("return", channel.send('Query Server not found!'));

          case 12:
            updatedList = sortedList.filter(function (_, i) {
              return i !== index;
            });
            _context3.next = 15;
            return _models.UT99QueryServers.findOneAndUpdate({
              server_id: serverId
            }, {
              query_servers: updatedList
            }).exec();

          case 15:
            _store["default"].dispatch((0, _actions.removeQueryServer)({
              serverId: serverId,
              index: index
            }));

            channel.send('Query Server removed');
            _context3.next = 22;
            break;

          case 19:
            _context3.prev = 19;
            _context3.t0 = _context3["catch"](3);
            console.log(_context3.t0);

          case 22:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[3, 19]]);
  }));

  return function delQueryServer(_x9, _x10, _x11, _x12) {
    return _ref11.apply(this, arguments);
  };
}();

exports.delQueryServer = delQueryServer;

var queryUT99Server =
/*#__PURE__*/
function () {
  var _ref15 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(_ref13, _ref14, serverId, _) {
    var channel, _ref16, arg, rest, state, _state$queryServers$s4, queryChannel, _state$queryServers$s5, list, sortedList, _ref17, host, _ref17$port, port, response, splitted, _final, _final$reduce, info, players, formattedResponse;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            channel = _ref13.channel;
            _ref16 = _toArray(_ref14), arg = _ref16[0], rest = _ref16.slice(1);
            _context4.prev = 2;
            state = _store["default"].getState();
            _state$queryServers$s4 = state.queryServers[serverId], queryChannel = _state$queryServers$s4.queryChannel, _state$queryServers$s5 = _state$queryServers$s4.list, list = _state$queryServers$s5 === void 0 ? [] : _state$queryServers$s5;

            if (!(queryChannel !== channel.id)) {
              _context4.next = 7;
              break;
            }

            return _context4.abrupt("return", channel.send("Active channel for querying is <#".concat(queryChannel, ">")));

          case 7:
            sortedList = list.sort(function (a, b) {
              return a.timestamp - b.timestamp;
            });
            _ref17 = sortedList[parseInt(arg) - 1] || arg.split(':').reduce(function (acc, curr, i) {
              i === 0 ? acc['host'] = curr : acc['port'] = curr;
              return acc;
            }, {}), host = _ref17.host, _ref17$port = _ref17.port, port = _ref17$port === void 0 ? 7777 : _ref17$port;

            if (host) {
              _context4.next = 11;
              break;
            }

            return _context4.abrupt("return", channel.send('Invalid query'));

          case 11:
            _context4.next = 13;
            return _API["default"].queryUT99Server(host, parseInt(port) + 1);

          case 13:
            response = _context4.sent;
            // UDP port is +1
            splitted = response.split('\\');
            _final = _toConsumableArray(splitted);

            _final.shift();

            _final.unshift();

            _final$reduce = _final.reduce(function (acc, curr) {
              if (curr === 'player_0' || curr === 'Player_0') acc.hasPlayersNow = true;
              acc.hasPlayersNow ? acc.players.push(curr) : acc.info.push(curr);
              return acc;
            }, {
              info: [],
              players: [],
              hasPlayersNow: false
            }), info = _final$reduce.info, players = _final$reduce.players;
            formattedResponse = (0, _formats.formatQueryServerStatus)(_objectSpread({}, (0, _utils.createAlternatingObject)(info), {
              host: host,
              port: port
            }), (0, _utils.createAlternatingObject)(players));
            channel.send(formattedResponse);
            _context4.next = 26;
            break;

          case 23:
            _context4.prev = 23;
            _context4.t0 = _context4["catch"](2);
            console.log(_context4.t0);

          case 26:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[2, 23]]);
  }));

  return function queryUT99Server(_x13, _x14, _x15, _x16) {
    return _ref15.apply(this, arguments);
  };
}();

exports.queryUT99Server = queryUT99Server;
//# sourceMappingURL=ut99Handlers.js.map