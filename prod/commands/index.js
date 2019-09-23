"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.emitters = exports.handlers = exports.commands = void 0;

var genericHandlers = _interopRequireWildcard(require("./genericHandlers"));

var ut99Handlers = _interopRequireWildcard(require("./ut99Handlers"));

var pugHandlers = _interopRequireWildcard(require("./pugHandlers"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var emitters = {
  pugEventEmitter: pugHandlers.pugEventEmitter
};
exports.emitters = emitters;

var handlers = _objectSpread({}, genericHandlers, {}, ut99Handlers, {}, pugHandlers);

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
  key: 'decideDefaultOrJoin',
  description: '',
  aliases: ['j', 'join'],
  solo: 2
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
  aliases: ['last'],
  solo: 2,
  regex: function regex(action) {
    return RegExp("^".concat(action, "(d|t)*"), 'g');
  }
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
  key: 'addOrRemoveTag',
  description: '',
  aliases: ['tag'],
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
}, {
  key: 'blockPlayer',
  description: '',
  aliases: ['block'],
  solo: 0
}, {
  key: 'unblockPlayer',
  description: '',
  aliases: ['unblock'],
  solo: 0
}, {
  key: 'showBlockedUsers',
  description: '',
  aliases: ['showblocked'],
  solo: 1
}, {
  key: 'setDefaultJoin',
  description: '',
  aliases: ['defaultjoin'],
  solo: 0
}, {
  key: 'declareWinner',
  description: '',
  aliases: ['winner'],
  solo: 0
}];
exports.commands = commands;
//# sourceMappingURL=index.js.map