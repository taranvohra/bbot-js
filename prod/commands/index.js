"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.emitters = exports.handlers = exports.commands = void 0;

var genericHandlers = _interopRequireWildcard(require("./genericHandlers"));

var ut99Handlers = _interopRequireWildcard(require("./ut99Handlers"));

var pugHandlers = _interopRequireWildcard(require("./pugHandlers"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var emitters = {
  pugEventEmitter: pugHandlers.pugEventEmitter
};
exports.emitters = emitters;

var handlers = _objectSpread({}, genericHandlers, ut99Handlers, pugHandlers);

exports.handlers = handlers;
var commands = [{
  key: 'registerServer',
  description: '',
  aliases: ['register'],
  solo: true
}, {
  key: 'registerQueryChannel',
  description: '',
  aliases: ['setquerychannel'],
  solo: true
}, {
  key: 'registerPugChannel',
  description: '',
  aliases: ['setpugchannel'],
  solo: true
}, {
  key: 'addQueryServer',
  description: '',
  aliases: ['addqueryserver'],
  solo: false
}, {
  key: 'delQueryServer',
  description: '',
  aliases: ['delqueryserver'],
  solo: false
}, {
  key: 'queryUT99Server',
  description: '',
  aliases: ['q', 'query'],
  solo: false
}, {
  key: 'servers',
  description: '',
  aliases: ['servers'],
  solo: true
}, {
  key: 'addGameType',
  description: '',
  aliases: ['addgametype', 'agm'],
  solo: false
}, {
  key: 'delGameType',
  description: '',
  aliases: ['delgametype', 'dgm'],
  solo: false
}, {
  key: 'listGameTypes',
  description: '',
  aliases: ['list', 'ls'],
  solo: true
}, {
  key: 'listAllCurrentGameTypes',
  description: '',
  aliases: ['lsa'],
  solo: true
}, {
  key: 'joinGameTypes',
  description: '',
  aliases: ['j', 'join'],
  solo: false
}, {
  key: 'leaveGameTypes',
  description: '',
  aliases: ['l', 'leave'],
  solo: false
}, {
  key: 'leaveAllGameTypes',
  description: '',
  aliases: ['lva'],
  solo: true
}, {
  key: 'addCaptain',
  description: '',
  aliases: ['captain', 'capt'],
  solo: true
}, {
  key: 'promoteAvailablePugs',
  description: '',
  aliases: ['p', 'promote'],
  solo: true
}, {
  key: 'pickPlayer',
  description: '',
  aliases: ['p', 'pick'],
  solo: false
}, {
  key: 'pugPicking',
  description: '',
  aliases: ['picking'],
  solo: true
}, {
  key: 'adminAddPlayer',
  description: '',
  aliases: ['adminadd'],
  solo: false
}, {
  key: 'adminRemovePlayer',
  description: '',
  aliases: ['adminremove'],
  solo: false
}, {
  key: 'adminPickPlayer',
  description: '',
  aliases: ['adminpick'],
  solo: false
}];
exports.commands = commands;
//# sourceMappingURL=index.js.map