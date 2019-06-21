"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handlers = exports.commands = void 0;

var genericHandlers = _interopRequireWildcard(require("./genericHandlers"));

var ut99Handlers = _interopRequireWildcard(require("./ut99Handlers"));

var pugHandlers = _interopRequireWildcard(require("./pugHandlers"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var handlers = _objectSpread({}, genericHandlers, ut99Handlers, pugHandlers);

exports.handlers = handlers;
var commands = [{
  key: 'registerServer',
  description: '',
  aliases: ['register']
}, {
  key: 'registerQueryChannel',
  description: '',
  aliases: ['setquerychannel']
}, {
  key: 'registerPugChannel',
  description: '',
  aliases: ['setpugchannel']
}, {
  key: 'addQueryServer',
  description: '',
  aliases: ['addqueryserver']
}, {
  key: 'delQueryServer',
  description: '',
  aliases: ['delqueryserver']
}, {
  key: 'queryUT99Server',
  description: '',
  aliases: ['q', 'query']
}, {
  key: 'servers',
  description: '',
  aliases: ['servers']
}, {
  key: 'addGameType',
  description: '',
  aliases: ['addgametype', 'agm']
}, {
  key: 'delGameType',
  description: '',
  aliases: ['delgametype', 'dgm']
}];
exports.commands = commands;
//# sourceMappingURL=index.js.map