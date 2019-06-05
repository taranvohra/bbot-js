"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setPugChannel = exports.setQueryChannel = exports.registerServer = void 0;

var _discordServers = _interopRequireDefault(require("../models/discordServers"));

var _store = _interopRequireDefault(require("../store"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var registerServer =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(message, _, serverId, __) {
    var res;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _discordServers["default"].findOne({
              server_id: serverId
            }).exec();

          case 3:
            res = _context.sent;

            if (!res) {
              _context.next = 6;
              break;
            }

            return _context.abrupt("return", message.channel.send('Server is already registered with bBot :wink:'));

          case 6:
            _context.next = 8;
            return new _discordServers["default"]({
              server_id: serverId
            }).save();

          case 8:
            message.channel.send('Server registered with bBot!');
            _context.next = 14;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](0);
            message.channel.send('Something went wrong. The developer of this bot has been notified ');

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 11]]);
  }));

  return function registerServer(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

exports.registerServer = registerServer;

var setQueryChannel =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(message, _, serverId, __) {
    var res;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return _discordServers["default"].findOne({
              server_id: serverId
            }).exec();

          case 3:
            res = _context2.sent;

            if (res) {
              _context2.next = 6;
              break;
            }

            return _context2.abrupt("return", message.channel.send('Please register the server with the bot! Type .register'));

          case 6:
            _context2.next = 8;
            return _discordServers["default"].findOneAndUpdate({
              server_id: serverId
            }, {
              query_channel: message.channel.id
            }).exec();

          case 8:
            _store["default"].dispatch({
              type: 'INIT',
              payload: {
                serverId: serverId,
                queryChannel: message.channel.id
              }
            });

            console.log(_store["default"].getState());
            message.channel.send("<#".concat(message.channel.id, "> has been set as the query channel"));
            _context2.next = 17;
            break;

          case 13:
            _context2.prev = 13;
            _context2.t0 = _context2["catch"](0);
            console.log(_context2.t0);
            message.channel.send('Something went wrong. The developer of this bot has been notified ');

          case 17:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 13]]);
  }));

  return function setQueryChannel(_x5, _x6, _x7, _x8) {
    return _ref2.apply(this, arguments);
  };
}();

exports.setQueryChannel = setQueryChannel;

var setPugChannel =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(message, _, serverId, __) {
    var res;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return _discordServers["default"].findOne({
              server_id: serverId
            }).exec();

          case 3:
            res = _context3.sent;

            if (res) {
              _context3.next = 6;
              break;
            }

            return _context3.abrupt("return", message.channel.send('Please register the server with the bot! Type .register'));

          case 6:
            _context3.next = 8;
            return _discordServers["default"].findOneAndUpdate({
              server_id: serverId
            }, {
              pug_channel: message.channel.id
            }).exec();

          case 8:
            _store["default"].dispatch({
              type: 'INIT',
              payload: {
                serverId: serverId,
                pugChannel: message.channel.id
              }
            });

            console.log(_store["default"].getState());
            message.channel.send("<#".concat(message.channel.id, "> has been set as the pug channel"));
            _context3.next = 17;
            break;

          case 13:
            _context3.prev = 13;
            _context3.t0 = _context3["catch"](0);
            console.log(_context3.t0);
            message.channel.send('Something went wrong. The developer of this bot has been notified ');

          case 17:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 13]]);
  }));

  return function setPugChannel(_x9, _x10, _x11, _x12) {
    return _ref3.apply(this, arguments);
  };
}();

exports.setPugChannel = setPugChannel;
//# sourceMappingURL=genericHandlers.js.map