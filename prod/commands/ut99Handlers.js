"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.delQueryServer = exports.addQueryServer = exports.servers = void 0;

var _store = _interopRequireDefault(require("../store"));

var _crypto = _interopRequireDefault(require("crypto"));

var _models = require("../models");

var _actions = require("../store/actions");

var _constants = require("../constants");

var _utils = require("../utils");

var _formats = require("../formats");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
            _context.next = 14;
            break;

          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](1);
            console.log(_context.t0);
            channel.send("Something went wrong!");

          case 14:
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

            if (!list.some(function (s) {
              return s.key === key;
            })) {
              _context2.next = 15;
              break;
            }

            return _context2.abrupt("return", channel.send('Query Server already exists!'));

          case 15:
            newServer = {
              key: key,
              name: name,
              host: host,
              port: port,
              timestamp: Date.now()
            };
            _context2.next = 18;
            return _models.UT99QueryServers.findOneAndUpdate({
              server_id: serverId
            }, {
              $push: {
                query_servers: newServer
              }
            }).exec();

          case 18:
            _store["default"].dispatch((0, _actions.pushQueryServer)({
              serverId: serverId,
              queryServer: newServer
            }));

            channel.send('Query Server added');
            _context2.next = 25;
            break;

          case 22:
            _context2.prev = 22;
            _context2.t0 = _context2["catch"](3);
            console.log(_context2.t0);

          case 25:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 22]]);
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
            index = parseInt(which);
            sortedList = list.sort(function (a, b) {
              return a.timestamp - b.timestamp;
            });
            console.log(sortedList);

            if (sortedList[index]) {
              _context3.next = 13;
              break;
            }

            return _context3.abrupt("return", channel.send('Query Server not found!'));

          case 13:
            updatedList = sortedList.filter(function (_, i) {
              return i !== parseInt(index);
            });
            _context3.next = 16;
            return _models.UT99QueryServers.findOneAndUpdate({
              server_id: serverId
            }, {
              query_servers: updatedList
            }).exec();

          case 16:
            _store["default"].dispatch((0, _actions.removeQueryServer)({
              serverId: serverId,
              index: parseInt(index)
            }));

            channel.send('Query Server removed');
            _context3.next = 23;
            break;

          case 20:
            _context3.prev = 20;
            _context3.t0 = _context3["catch"](3);
            console.log(_context3.t0);

          case 23:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[3, 20]]);
  }));

  return function delQueryServer(_x9, _x10, _x11, _x12) {
    return _ref11.apply(this, arguments);
  };
}();

exports.delQueryServer = delQueryServer;
//# sourceMappingURL=ut99Handlers.js.map