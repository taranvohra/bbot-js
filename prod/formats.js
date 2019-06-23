"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatListAllCurrentGameTypes = exports.formatBroadcastPug = exports.formatDeadPugs = exports.formatLeaveStatus = exports.formatJoinStatus = exports.formatListGameTypes = exports.formatQueryServerStatus = exports.formatQueryServers = void 0;

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
    acc += "**".concat(curr.name.toUpperCase(), "** (").concat(curr.players, "/").concat(curr.maxPlayers, ") ").concat(i === list.length - 1 ? '' : ':small_blue_diamond:');
    return acc;
  }, "");
  return "".concat(title, "\n").concat(body);
};

exports.formatListGameTypes = formatListGameTypes;

var formatJoinStatus = function formatJoinStatus(statuses) {
  var _statuses$reduce = statuses.reduce(function (acc, _ref) {
    var joined = _ref.joined,
        user = _ref.user,
        name = _ref.name,
        activeCount = _ref.activeCount,
        maxPlayers = _ref.maxPlayers;

    switch (joined) {
      case -1:
        acc.nf += "No pug found : **".concat(name.toUpperCase(), "**\n");
        break;

      case 0:
        acc.missed += "Sorry, **".concat(name.toUpperCase(), "** is already filled\n");

      case 1:
        acc.joined += "**".concat(name.toUpperCase(), "** (").concat(activeCount, "/").concat(maxPlayers, ") :small_blue_diamond: ");
        break;

      case 2:
        acc.aj += "**".concat(name.toUpperCase(), "** ");
        break;

      default:
        null;
    }

    acc.user = user;
    return acc;
  }, {
    joined: "",
    missed: "",
    nf: "",
    aj: "",
    user: null
  }),
      joined = _statuses$reduce.joined,
      missed = _statuses$reduce.missed,
      nf = _statuses$reduce.nf,
      aj = _statuses$reduce.aj,
      user = _statuses$reduce.user;

  var body = "".concat(joined.length > 0 ? "".concat(user.username, " joined :small_blue_diamond: ").concat(joined) : "", " ").concat(missed.length > 0 ? "\n".concat(missed) : "", " ").concat(aj.length > 0 ? "\n".concat(user.username, ", you have already joined ").concat(aj) : "", " ").concat(nf.length > 0 ? "\n".concat(nf) : "");
  return body;
};

exports.formatJoinStatus = formatJoinStatus;

var formatLeaveStatus = function formatLeaveStatus(statuses, isOffline) {
  var _statuses$reduce2 = statuses.reduce(function (acc, _ref2) {
    var left = _ref2.left,
        name = _ref2.name,
        user = _ref2.user,
        activeCount = _ref2.activeCount,
        maxPlayers = _ref2.maxPlayers;

    switch (left) {
      case 1:
        acc.left += "".concat(acc.left.length > 0 ? ", " : "", "**").concat(name.toUpperCase(), "** (").concat(activeCount, "/").concat(maxPlayers, ")");
        acc.user = user;
        break;

      case 0:
        acc.nj = "Cannot leave pug(s) if you haven't joined :head_bandage:";
        break;

      case -1:
        acc.nf += "No pug found : **".concat(name.toUpperCase(), "**\n");
        break;

      default:
        null;
    }

    return acc;
  }, {
    user: null,
    left: "",
    nj: "",
    nf: ""
  }),
      left = _statuses$reduce2.left,
      nj = _statuses$reduce2.nj,
      nf = _statuses$reduce2.nf,
      user = _statuses$reduce2.user;

  var body = "".concat(left.length > 0 ? "".concat(user.username, " left  ").concat(left, " ").concat(isOffline ? "because the person went offline" : "") : "").concat(nj.length > 0 ? "\n".concat(nj) : "").concat(nf.length > 0 ? "\n".concat(nf) : "");
  return body;
};

exports.formatLeaveStatus = formatLeaveStatus;

var formatDeadPugs = function formatDeadPugs(deadPugs) {
  var body = deadPugs.reduce(function (acc, curr, i) {
    acc += "".concat(i > 0 ? "\n" : "", " :joy_cat: **").concat(curr.name.toUpperCase(), "** was stopped because **").concat(curr.user.username, "** left :joy_cat: ");
    return acc;
  }, "");
  return body;
};

exports.formatDeadPugs = formatDeadPugs;

var formatBroadcastPug = function formatBroadcastPug(toBroadcast) {
  var title = "**".concat(toBroadcast.name.toUpperCase(), "** has been filled!");
  var body = toBroadcast.players.reduce(function (acc, player) {
    acc += "<@".concat(player.id, "> ");
    return acc;
  }, "");
  var footer = "Type **".concat(_constants.prefix, "captain** to become a captain for this pug. Random captains will be picked in ").concat(_constants.captainTimeout / 1000, " seconds");
  return "".concat(title, "\n").concat(body).concat(footer, "\n");
};

exports.formatBroadcastPug = formatBroadcastPug;

var formatListAllCurrentGameTypes = function formatListAllCurrentGameTypes(list, guildName) {
  var body = list.reduce(function (prev, curr) {
    var base = "**".concat(curr.name.toUpperCase(), "** (").concat(curr.players.length, "/").concat(curr.noOfPlayers, ") ");
    var players = curr.players.reduce(function (acc, u) {
      acc += ":small_blue_diamond: ".concat(u.username, " ");
      return acc;
    }, "");
    prev += "".concat(base, " ").concat(players, "\n");
    return prev;
  }, "");
  return body ? "Listing active pugs at **".concat(guildName, "**\n").concat(body) : "There are currently no active pugs, try joining one!";
};

exports.formatListAllCurrentGameTypes = formatListAllCurrentGameTypes;
//# sourceMappingURL=formats.js.map