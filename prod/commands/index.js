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
  solo: 1
}, {
  key: 'registerQueryChannel',
  description: '',
  aliases: ['setquerychannel'],
  solo: 1
}, {
  key: 'registerPugChannel',
  description: '',
  aliases: ['setpugchannel'],
  solo: 1
}, {
  key: 'addQueryServer',
  description: '',
  aliases: ['addqueryserver'],
  solo: 0
}, {
  key: 'delQueryServer',
  description: '',
  aliases: ['delqueryserver'],
  solo: 0
}, {
  key: 'queryUT99Server',
  description: '',
  aliases: ['q', 'query'],
  solo: 0
}, {
  key: 'servers',
  description: '',
  aliases: ['servers'],
  solo: 1
}, {
  key: 'addGameType',
  description: '',
  aliases: ['addgametype', 'agm'],
  solo: 0
}, {
  key: 'delGameType',
  description: '',
  aliases: ['delgametype', 'dgm'],
  solo: 0
}, {
  key: 'listGameTypes',
  description: '',
  aliases: ['list', 'ls'],
  solo: 2
}, {
  key: 'listAllCurrentGameTypes',
  description: '',
  aliases: ['lsa'],
  solo: 1
}, {
  key: 'joinGameTypes',
  description: '',
  aliases: ['j', 'join'],
  solo: 0
}, {
  key: 'leaveGameTypes',
  description: '',
  aliases: ['l', 'leave'],
  solo: 0
}, {
  key: 'leaveAllGameTypes',
  description: '',
  aliases: ['lva'],
  solo: 1
}, {
  key: 'addCaptain',
  description: '',
  aliases: ['captain', 'capt'],
  solo: 1
}, {
  key: 'decidePromoteOrPick',
  description: '',
  aliases: ['p', 'pick', 'promote'],
  solo: 2
}, {
  key: 'pugPicking',
  description: '',
  aliases: ['picking'],
  solo: 1
}, {
  key: 'checkLastPugs',
  description: '',
  aliases: ['last', 'lastt', 'lasttt'],
  solo: 2
}, {
  key: 'resetPug',
  description: '',
  aliases: ['reset'],
  solo: 0
}, {
  key: 'checkStats',
  description: '',
  aliases: ['stats'],
  solo: 2
}, {
  key: 'adminAddPlayer',
  description: '',
  aliases: ['adminadd'],
  solo: 0
}, {
  key: 'adminRemovePlayer',
  description: '',
  aliases: ['adminremove'],
  solo: 0
}, {
  key: 'adminPickPlayer',
  description: '',
  aliases: ['adminpick'],
  solo: 0
}];
exports.commands = commands;
//# sourceMappingURL=index.js.map