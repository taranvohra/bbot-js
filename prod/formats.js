"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatListGameTypes = exports.formatQueryServerStatus = exports.formatQueryServers = void 0;

var _discord = _interopRequireDefault(require("discord.js"));

var _utils = require("./utils");

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var embedColor = '#11806A';

var formatQueryServers = function formatQueryServers(list) {
  var richEmbed = new _discord["default"].RichEmbed();
  var description = list.reduce(function (acc, curr, index) {
    acc += "`".concat(index + 1, "`\xA0\xA0\xA0").concat(curr.name, "\n");
    return acc;
  }, '');
  richEmbed.setTitle("IP\xA0\xA0\xA0Name");
  richEmbed.setColor(embedColor);
  richEmbed.setDescription(description || 'No game servers added yet');
  richEmbed.setFooter('To query, type .q ip');
  return richEmbed;
};

exports.formatQueryServers = formatQueryServers;

var formatQueryServerStatus = function formatQueryServerStatus(info, players) {
  var richEmbed = new _discord["default"].RichEmbed();
  var xServerQueryProps = {
    remainingTime: null,
    teamScores: {}
  };
  var playerList = (0, _utils.getPlayerList)(players, parseInt(info.numplayers) || 0, !!info.maxteams);

  if (info.xserverquery) {
    var _getMinutesAndSeconds = (0, _utils.getMinutesAndSeconds)(parseInt(info.remainingtime)),
        minutes = _getMinutesAndSeconds.minutes,
        seconds = _getMinutesAndSeconds.seconds;

    var teamScores = (0, _utils.getTeamScores)(info, info.maxteams);
    xServerQueryProps.remainingTime = "".concat(minutes === parseInt(info.timelimit) && seconds === 0 || minutes < parseInt(info.timelimit) ? '**Remaining Time:**' : '**Overtime**:', " ").concat((0, _utils.padNumberWithZeros)(minutes), ":").concat((0, _utils.padNumberWithZeros)(seconds), " \n");
    xServerQueryProps.teamScores = Object.keys(teamScores).reduce(function (acc, curr) {
      var index = (0, _utils.getTeamIndex)(curr);
      acc[index] = " \u2022 ".concat(teamScores[curr]);
      return acc;
    }, []);
  }

  Object.keys(playerList).forEach(function (team) {
    var teamIndex = (0, _utils.getTeamIndex)(team);
    var p = playerList[team];
    var teamPlayers = p.reduce(function (acc, curr) {
      if (team == _constants.teams.spec) acc += curr + ' • ';else acc += curr + ' ' + '\n';
      return acc;
    }, '');
    p.length > 0 ? richEmbed.addField(team + (xServerQueryProps.teamScores[teamIndex] || ""), teamPlayers, team !== _constants.teams.spec) : '';
  });
  var description = "**Map:** ".concat(info.mapname, "\n**Players:** ").concat(info.numplayers, "/").concat(info.maxplayers, "\n").concat(xServerQueryProps.remainingTime || '');
  var footerText = "unreal://".concat(info.host, ":").concat(info.port);
  richEmbed.setTitle(info.hostname);
  richEmbed.setColor(embedColor);
  richEmbed.setDescription(description);
  richEmbed.setFooter(footerText);
  return richEmbed;
};

exports.formatQueryServerStatus = formatQueryServerStatus;

var formatListGameTypes = function formatListGameTypes(guildName, list) {
  var title = "Pugs available at **".concat(guildName, "**");
  var sortedList = list.sort(function (a, b) {
    return b.players - a.players;
  }); // by number of joined players

  var body = sortedList.reduce(function (acc, curr, i) {
    acc += "**".concat(curr.name, "** (").concat(curr.players, "/").concat(curr.maxPlayers, ") ").concat(i === list.length - 1 ? '' : ':small_blue_diamond:');
    return acc;
  }, "");
  return "".concat(title, "\n").concat(body);
};

exports.formatListGameTypes = formatListGameTypes;
//# sourceMappingURL=formats.js.map