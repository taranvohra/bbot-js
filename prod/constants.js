"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.emojis = exports.pugEvents = exports.offline = exports.captainTimeout = exports.tagLength = exports.teams = exports.privilegedRoles = exports.prefix = void 0;
var prefix = '-';
exports.prefix = prefix;
var privilegedRoles = ['Admins', 'Moderators'];
exports.privilegedRoles = privilegedRoles;
var teams = {
  team_0: 'Red Team',
  team_1: 'Blue Team',
  team_2: 'Green Team',
  team_3: 'Gold Team',
  team_255: 'Players',
  spec: 'Spectators'
};
exports.teams = teams;
var tagLength = 30;
exports.tagLength = tagLength;
var captainTimeout = 30000;
exports.captainTimeout = captainTimeout;
var offline = 'unplugged';
exports.offline = offline;
var pugEvents = {
  captainsReady: 'captainsReady'
};
exports.pugEvents = pugEvents;
var emojis = {
  moskva: '<:moskva:610047429634686976>',
  tearddy: '<:tearddy:601092340865564673>',
  pupcurn: '<a:pupcurn:610049697402454016>',
  residentsleeper: '<:residentsleeper:601092229343215646>',
  trumpXD: '<:trumpXD:610050412749258754>',
  smart: '<:smart:601094351770353664>',
  bannechu: '<:bannechu:601092624962682881>'
};
exports.emojis = emojis;
//# sourceMappingURL=constants.js.map