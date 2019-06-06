"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addQueryServer = exports.servers = void 0;

var _store = _interopRequireDefault(require("../store"));

var _crypto = _interopRequireDefault(require("crypto"));

var _models = require("../models");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var servers =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(_ref, _, serverId, __) {
    var channel, state, _state$queryServers$s, queryChannel, queryServers;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            channel = _ref.channel;
            _context.prev = 1;
            state = _store["default"].getState();
            _state$queryServers$s = state.queryServers[serverId], queryChannel = _state$queryServers$s.queryChannel, queryServers = _objectWithoutProperties(_state$queryServers$s, ["queryChannel"]);

            if (!(queryChannel !== channel.id)) {
              _context.next = 6;
              break;
            }

            return _context.abrupt("return", channel.send("Active channel for querying is <#".concat(queryChannel, ">")));

          case 6:
            _context.next = 10;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](1);

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 8]]);
  }));

  return function servers(_x, _x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

exports.servers = servers;

var addQueryServer =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(_ref3, _ref4, serverId, __) {
    var channel, _ref6, hp, rest, state, _state$queryServers$s2, queryChannel, queryServers, _hp$split, _hp$split2, host, port, name, key, newServer;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            channel = _ref3.channel;
            _ref6 = _toArray(_ref4), hp = _ref6[0], rest = _ref6.slice(1);
            _context2.prev = 2;
            state = _store["default"].getState();
            _state$queryServers$s2 = state.queryServers[serverId], queryChannel = _state$queryServers$s2.queryChannel, queryServers = _objectWithoutProperties(_state$queryServers$s2, ["queryChannel"]);
            _hp$split = hp.split(':'), _hp$split2 = _slicedToArray(_hp$split, 2), host = _hp$split2[0], port = _hp$split2[1];
            name = rest.reduce(function (acc, curr) {
              return acc += curr + ' ';
            }, '');

            if (!(!host || !port || !name)) {
              _context2.next = 9;
              break;
            }

            return _context2.abrupt("return", channel.send('Invalid command'));

          case 9:
            key = _crypto["default"].createHash('sha256').update(hp).digest('hex');

            if (!queryServers.some(function (s) {
              return s.key === key;
            })) {
              _context2.next = 12;
              break;
            }

            return _context2.abrupt("return", channel.send('Query Server already exists!'));

          case 12:
            newServer = {
              server_id: serverId,
              key: key,
              name: name,
              host: host,
              port: port,
              timestamp: Date.now()
            };
            _context2.next = 15;
            return _models.UT99QueryServers.findOneAndUpdate({
              server_id: serverId
            }, {
              $push: {
                query_servers: newServer
              }
            }).exec();

          case 15:
            channel.send('Query Server added');
            _context2.next = 21;
            break;

          case 18:
            _context2.prev = 18;
            _context2.t0 = _context2["catch"](2);
            console.log(_context2.t0);

          case 21:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[2, 18]]);
  }));

  return function addQueryServer(_x5, _x6, _x7, _x8) {
    return _ref5.apply(this, arguments);
  };
}();

exports.addQueryServer = addQueryServer;
//# sourceMappingURL=ut99Handlers.js.map