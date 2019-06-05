"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commands = exports.prefix = void 0;
var prefix = '~'; //TODO: Add it to commands folder

exports.prefix = prefix;
var commands = [{
  key: 'registerServer',
  description: '',
  aliases: ['register']
}, {
  key: 'setQueryChannel',
  description: '',
  aliases: ['setquerychannel']
}, {
  key: 'setPugChannel',
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
}];
exports.commands = commands;
//# sourceMappingURL=contants.js.map