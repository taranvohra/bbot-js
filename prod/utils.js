"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTeamIndex = exports.getTeamScores = exports.padNumberWithZeros = exports.getMinutesAndSeconds = exports.sanitizeName = exports.createAlternatingObject = exports.getPlayerList = exports.hasPrivilegedRole = void 0;

var _constants = require("./constants");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var hasPrivilegedRole = function hasPrivilegedRole(privilegedRoles, userRoles) {
  return privilegedRoles.some(function (pr) {
    return userRoles.find(function (ur) {
      return ur.name === pr;
    });
  });
};
/**
 * @param {Object} players
 * @param {Number} noOfPlayers
 * @param {Number} noOfTeams
 */


exports.hasPrivilegedRole = hasPrivilegedRole;

var getPlayerList = function getPlayerList(players, noOfPlayers, noOfTeams) {
  var _playerList;

  var playerList = (_playerList = {}, _defineProperty(_playerList, _constants.teams.team_0, []), _defineProperty(_playerList, _constants.teams.team_1, []), _defineProperty(_playerList, _constants.teams.team_2, []), _defineProperty(_playerList, _constants.teams.team_3, []), _defineProperty(_playerList, _constants.teams.team_255, []), _defineProperty(_playerList, _constants.teams.spec, []), _playerList);

  for (var i = 0; i < noOfPlayers; i++) {
    var playerFlag = players["countryc_".concat(i)] && players["countryc_".concat(i)] !== 'none' ? ":flag_".concat(players["countryc_".concat(i)], ":") : ":flag_white:";
    var player = "".concat(playerFlag, " ").concat(sanitizeName(players["player_".concat(i)]));

    if (players["mesh_".concat(i)] === 'Spectator') {
      playerList[_constants.teams.spec].push(player);

      continue;
    }

    if (noOfTeams > 0) {
      var team = parseInt(players["team_".concat(i)]); // returns an index for the team

      playerList[Object.values(_constants.teams)[team]].push(player);
    } else {
      playerList[_constants.teams.team_255].push(player);
    }
  }

  return playerList;
};
/**
 * @param {Array} array
 * @description Creates a new object with the even index as key and odd index as the value
 * @returns {Object}
 */


exports.getPlayerList = getPlayerList;

var createAlternatingObject = function createAlternatingObject(array) {
  return array.reduce(function (acc, item, i, arr) {
    if (i % 2 === 0) acc[item.toLowerCase()] = arr[i + 1];
    return acc;
  }, {});
};
/**
 * @param {String} name
 * @description Escapes special characters in the name
 * @returns {String}
 */


exports.createAlternatingObject = createAlternatingObject;

var sanitizeName = function sanitizeName(name) {
  return name.replace(/(\*|`|:)/g, function (c) {
    return "\\" + c;
  });
};
/**
 * @param {Number} time
 * @description Gives minutes and seconds
 * @returns {Object}
 */


exports.sanitizeName = sanitizeName;

var getMinutesAndSeconds = function getMinutesAndSeconds(time) {
  var seconds = time % 60;
  var minutes = (time - seconds) / 60;
  return {
    seconds: seconds,
    minutes: minutes
  };
};
/**
 * @param {Number} number
 * @description padded with zero(s)
 * @returns {String}
 */


exports.getMinutesAndSeconds = getMinutesAndSeconds;

var padNumberWithZeros = function padNumberWithZeros(number) {
  return number > -1 && number < 10 ? "0".concat(number) : "".concat(number);
};
/**
 * @param {Object} info
 * @param {Number} maxTeams
 * @description Gives the respective scores for all teams
 * @returns {Object}
 */


exports.padNumberWithZeros = padNumberWithZeros;

var getTeamScores = function getTeamScores(info, maxTeams) {
  var _teamScores;

  var teamScores = (_teamScores = {}, _defineProperty(_teamScores, _constants.teams.team_0, null), _defineProperty(_teamScores, _constants.teams.team_1, null), _defineProperty(_teamScores, _constants.teams.team_2, null), _defineProperty(_teamScores, _constants.teams.team_3, null), _teamScores);

  for (var i = 0; i < maxTeams; i++) {
    teamScores[Object.values(_constants.teams)[i]] = info["teamscore_".concat(i)];
  }

  return teamScores;
};
/**
 * @param {String} teamName
 * @description Returns the index for the team
 * @returns {Number}
 */


exports.getTeamScores = getTeamScores;

var getTeamIndex = function getTeamIndex(teamName) {
  return Object.values(_constants.teams).findIndex(function (t) {
    return t === teamName;
  });
};

exports.getTeamIndex = getTeamIndex;
//# sourceMappingURL=utils.js.map