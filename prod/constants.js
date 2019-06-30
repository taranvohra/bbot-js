"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pugEvents = exports.offline = exports.captainTimeout = exports.tagLength = exports.teams = exports.privilegedRoles = exports.prefix = void 0;
var prefix = '.';
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
//# sourceMappingURL=constants.js.map