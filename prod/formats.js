"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatUserStats = exports.formatLastPugStatus = exports.formatPromoteAvailablePugs = exports.formatBroadcastCaptainsReady = exports.formatPugsInPicking = exports.formatPickPlayerStatus = exports.formatAddCaptainStatus = exports.formatListAllCurrentGameTypes = exports.formatListGameType = exports.formatBroadcastPug = exports.formatDeadPugs = exports.formatLeaveStatus = exports.formatJoinStatus = exports.formatListGameTypes = exports.formatQueryServerStatus = exports.formatQueryServers = void 0;

var _discord = _interopRequireDefault(require("discord.js"));

var _utils = require("./utils");

var _constants = require("./constants");

var _dateFns = require("date-fns");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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
    acc += "**".concat(curr.name.toUpperCase(), "** (").concat(curr.players, "/").concat(curr.maxPlayers, ") ").concat(i === list.length - 1 ? '' : ':small_orange_diamond:');
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
        acc.nf += "No pug found: **".concat(name.toUpperCase(), "**\n");
        break;

      case 0:
        acc.missed += "Sorry, **".concat(name.toUpperCase(), "** is already filled ").concat(_constants.emojis.tearddy, "\n");
        break;

      case 1:
        acc.joined += "**".concat(name.toUpperCase(), "** (").concat(activeCount, "/").concat(maxPlayers, ") :small_orange_diamond: ");
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

  var body = "".concat(joined.length > 0 ? "".concat(user.username, " joined :small_orange_diamond: ").concat(joined) : "", " ").concat(missed.length > 0 ? "\n".concat(missed) : "", " ").concat(aj.length > 0 ? "\n".concat(user.username, ", you have already joined ").concat(aj) : "", " ").concat(nf.length > 0 ? "\n".concat(nf) : "");
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
        acc.nj = "Cannot leave pug(s) you haven't joined ".concat(_constants.emojis.smart);
        break;

      case -1:
        acc.nf += "No pug found: **".concat(name.toUpperCase(), "**\n");
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

  var body = "".concat(left.length > 0 ? "".concat(user.username, " left  ").concat(left, " ").concat(isOffline ? "because the user went offline ".concat(_constants.emojis.residentsleeper).concat(_constants.emojis.pupcurn) : "") : "").concat(nj.length > 0 ? "\n".concat(nj) : "").concat(nf.length > 0 ? "\n".concat(nf) : "");
  return body;
};

exports.formatLeaveStatus = formatLeaveStatus;

var formatDeadPugs = function formatDeadPugs(deadPugs) {
  var body = deadPugs.reduce(function (acc, _ref3, i) {
    var pug = _ref3.pug,
        user = _ref3.user;
    acc += "".concat(i > 0 ? "\n" : "", " ").concat(_constants.emojis.peepoComfy, " **").concat(pug.name.toUpperCase(), "** was stopped because **").concat(user.username, "** left ").concat(_constants.emojis.peepoComfy);
    return acc;
  }, "");
  return body;
};

exports.formatDeadPugs = formatDeadPugs;

var formatBroadcastPug = function formatBroadcastPug(toBroadcast) {
  var title = "".concat(_constants.emojis.moskva, " :mega: **").concat(toBroadcast.name.toUpperCase(), "** has been filled!");
  var body = toBroadcast.players.reduce(function (acc, player) {
    acc += "<@".concat(player.id, "> ");
    return acc;
  }, "");
  var footer = "Type **".concat(_constants.prefix, "captain** to become a captain for this pug. Random captains will be picked in ").concat(_constants.captainTimeout / 1000, " seconds");
  return "".concat(title, "\n").concat(body, "\n").concat(footer, "\n");
};

exports.formatBroadcastPug = formatBroadcastPug;

var formatListGameType = function formatListGameType(pug) {
  var title = "**".concat(pug.name.toUpperCase(), "** (").concat(pug.players.length, "/").concat(pug.noOfPlayers, ")");
  var players = pug.players.reduce(function (acc, u) {
    acc += ":small_orange_diamond: ".concat(u.username, " ");
    return acc;
  }, "");
  return "".concat(title).concat(players);
};

exports.formatListGameType = formatListGameType;

var formatListAllCurrentGameTypes = function formatListAllCurrentGameTypes(list, guildName) {
  var body = list.reduce(function (prev, curr) {
    var base = "**".concat(curr.name.toUpperCase(), "** (").concat(curr.players.length, "/").concat(curr.noOfPlayers, ") ");
    var players = curr.players.reduce(function (acc, u) {
      acc += ":small_orange_diamond: ".concat(u.username, " ");
      return acc;
    }, "");
    prev += "".concat(base).concat(players, "\n");
    return prev;
  }, "");
  return body ? "Listing active pugs at **".concat(guildName, "**\n").concat(body) : "There are currently no active pugs, try joining one!";
};

exports.formatListAllCurrentGameTypes = formatListAllCurrentGameTypes;

var formatAddCaptainStatus = function formatAddCaptainStatus(user, _ref4) {
  var team = _ref4.team;
  var body = "**".concat(user.username, "** became captain for ").concat(_constants.teamEmojis["team_".concat(team)], " **").concat(_constants.teams["team_".concat(team)].toUpperCase(), "** ").concat(_constants.teamEmojis["team_".concat(team)]);
  return body;
};

exports.formatAddCaptainStatus = formatAddCaptainStatus;

var formatPickPlayerStatus = function formatPickPlayerStatus(_ref5) {
  var pickedPlayers = _ref5.pickedPlayers,
      finished = _ref5.finished,
      pug = _ref5.pug;
  var picked = pickedPlayers.reduce(function (acc, curr) {
    acc += "<@".concat(curr.player.id, "> was picked for **").concat(_constants.teams["team_".concat(curr.team)], "**\n");
    return acc;
  }, "");
  var count = 0;
  var next = pug.captains[pug.pickingOrder[pug.turn]];

  if (!finished) {
    for (var i = pug.turn;; i++) {
      if (pug.pickingOrder[i] !== next.team) break;
      count++;
    }
  }

  var turn = finished ? ":fire: **Picking has finished** :fire:" : "<@".concat(next.id, "> pick ").concat(count, " player").concat(count > 1 ? 's' : '', " for **").concat(_constants.teams["team_".concat(next.team)], "**");
  var pugTeams = Array(pug.noOfTeams).fill(0).reduce(function (acc, _, i) {
    acc[i] = "**".concat(_constants.teams["team_".concat(i)], "** ").concat(_constants.teamEmojis["team_".concat(i)], " ");
    return acc;
  }, {});
  var players = pug.players.reduce(function (acc, curr, index) {
    if (curr.team === null) acc += "**".concat(index + 1, ")** *").concat(curr.username, "* (").concat(curr.rating === 0 ? 'no rating' : curr.rating.toFixed(2), ") ").concat(curr.tag ? "[".concat(curr.tag, "] ") : '');
    return acc;
  }, "Players: ");

  var currTeams = _toConsumableArray(pug.players).sort(function (a, b) {
    return a.pick - b.pick;
  }).reduce(function (acc, curr) {
    if (curr.team !== null) acc[curr.team] += "*".concat(curr.username, "* :small_orange_diamond: ");
    return acc;
  }, pugTeams);

  var activeTeams = Object.values(currTeams).reduce(function (acc, curr) {
    acc += "".concat(curr.slice(0, curr.length - 24), "\n");
    return acc;
  }, "");
  return "".concat(picked, "\n").concat(turn, "\n").concat(finished ? '' : '\n').concat(finished ? "" : "".concat(players, "\n"), "\n").concat(activeTeams);
};

exports.formatPickPlayerStatus = formatPickPlayerStatus;

var formatPugsInPicking = function formatPugsInPicking(pugsInPicking) {
  var body = pugsInPicking.reduce(function (acc, pug) {
    var count = 0;
    var next = pug.captains[pug.pickingOrder[pug.turn]];

    for (var i = pug.turn;; i++) {
      if (pug.pickingOrder[i] !== next.team) break;
      count++;
    }

    var turn = "<@".concat(next.id, "> pick ").concat(count, " player").concat(count > 1 ? 's' : '', " for **").concat(_constants.teams["team_".concat(next.team)], "**");
    var pugTeams = Array(pug.noOfTeams).fill(0).reduce(function (acc, _, i) {
      acc[i] = "**".concat(_constants.teams["team_".concat(i)], "** ").concat(_constants.teamEmojis["team_".concat(i)], " ");
      return acc;
    }, {});
    var players = pug.players.reduce(function (acc, curr, index) {
      if (curr.team === null) acc += "**".concat(index + 1, ")** *").concat(curr.username, "* (").concat(curr.rating === 0 ? 'no rating' : curr.rating.toFixed(2), ") ").concat(curr.tag ? "[".concat(curr.tag, "] ") : '');
      return acc;
    }, "Players: ");

    var currTeams = _toConsumableArray(pug.players).sort(function (a, b) {
      return a.pick - b.pick;
    }).reduce(function (acc, curr) {
      if (curr.team !== null) acc[curr.team] += "*".concat(curr.username, "* :small_orange_diamond: ");
      return acc;
    }, pugTeams);

    var activeTeams = Object.values(currTeams).reduce(function (acc, curr) {
      acc += "".concat(curr.slice(0, curr.length - 24), "\n");
      return acc;
    }, "");
    acc += "".concat(turn, "\n\n").concat(players, "\n\n").concat(activeTeams, "\n\n");
    return acc;
  }, "");
  return body;
};

exports.formatPugsInPicking = formatPugsInPicking;

var formatBroadcastCaptainsReady = function formatBroadcastCaptainsReady(_ref6) {
  var players = _ref6.players,
      captains = _ref6.captains;
  var pugCaptains = captains.reduce(function (acc, curr, index) {
    acc += "<@".concat(curr.id, "> is the captain for ").concat(_constants.teamEmojis["team_".concat(index)], " **").concat(_constants.teams["team_".concat(index)], "** ").concat(_constants.teamEmojis["team_".concat(index)], "\n");
    return acc;
  }, "");
  var turn = "<@".concat(captains[0].id, "> pick 1 player for **").concat(_constants.teams["team_0"], "**");

  var _players$reduce = players.reduce(function (acc, curr, index) {
    if (curr.captain === null) acc.pugPlayers += "**".concat(index + 1, ")** *").concat(curr.username, "* (").concat(curr.rating === 0 ? 'no rating' : curr.rating.toFixed(2), ") ").concat(curr.tag ? "[".concat(curr.tag, "] ") : '');
    return acc;
  }, {
    pugPlayers: "Players: "
  }),
      pugPlayers = _players$reduce.pugPlayers;

  return "".concat(pugCaptains, "\n").concat(turn, "\n").concat(pugPlayers);
};

exports.formatBroadcastCaptainsReady = formatBroadcastCaptainsReady;

var formatPromoteAvailablePugs = function formatPromoteAvailablePugs(pugs, guildName) {
  var title = "@here in **".concat(guildName, "**");
  var body = pugs.reduce(function (acc, curr) {
    if (!curr.picking) {
      acc += "**".concat(curr.noOfPlayers - curr.players.length, "** more needed for **").concat(curr.name.toUpperCase(), "**\n");
    }

    return acc;
  }, "");
  return "".concat(title, "\n").concat(body);
};

exports.formatPromoteAvailablePugs = formatPromoteAvailablePugs;

var formatLastPugStatus = function formatLastPugStatus(_ref7, action, timestamp, _ref8) {
  var pug = _ref7.pug,
      guildName = _ref7.guildName;
  var winner = _ref8.winner,
      updated = _ref8.updated;
  var distanceInWords = (0, _dateFns.distanceInWordsStrict)(new Date(), timestamp, {
    addSuffix: true
  });
  var title = "".concat(action.charAt(0).toUpperCase() + action.slice(1), " **").concat(pug.name.toUpperCase(), "** at **").concat(guildName, "** (").concat(distanceInWords, ")");
  var pugTeams = Array(pug.noOfTeams).fill(0).reduce(function (acc, _, i) {
    acc[i] = "**".concat(_constants.teams["team_".concat(i)], "** ").concat(_constants.teamEmojis["team_".concat(i)], " ");
    return acc;
  }, {});

  var currTeams = _toConsumableArray(pug.players).sort(function (a, b) {
    return a.pick - b.pick;
  }).reduce(function (acc, curr) {
    if (curr.team !== null) acc[curr.team] += "*".concat(curr.username, "* :small_orange_diamond: ");
    return acc;
  }, pugTeams);

  var activeTeams = Object.values(currTeams).reduce(function (acc, curr) {
    acc += "".concat(curr.slice(0, curr.length - 24), "\n");
    return acc;
  }, "");
  var result = winner !== undefined ? ":trophy: ".concat(_constants.teamEmojis["team_".concat(winner)], " :trophy:") : "";
  return "".concat(updated ? "Pug Stat Updated\n\n" : "").concat(title, "\n\n").concat(activeTeams, "\n").concat(result);
};

exports.formatLastPugStatus = formatLastPugStatus;

var formatUserStats = function formatUserStats(_ref9) {
  var username = _ref9.username,
      stats = _ref9.stats,
      last_pug = _ref9.last_pug;

  var _Object$values$reduce = Object.values(stats).reduce(function (acc, curr) {
    acc.totalPugs += curr.totalPugs || 0;
    acc.totalCaptains += curr.totalCaptain || 0;
    acc.totalWins += curr.won || 0;
    acc.totalLosses += curr.lost || 0;
    return acc;
  }, {
    totalPugs: 0,
    totalCaptains: 0,
    totalWins: 0,
    totalLosses: 0,
    totalWinRate: 0,
    totalGameTypes: 0
  }),
      totalPugs = _Object$values$reduce.totalPugs,
      totalCaptains = _Object$values$reduce.totalCaptains,
      totalWins = _Object$values$reduce.totalWins,
      totalLosses = _Object$values$reduce.totalLosses,
      totalWinRate = _Object$values$reduce.totalWinRate,
      totalGameTypes = _Object$values$reduce.totalGameTypes;

  var title = ":pencil: Showing stats for **".concat(username, "** :pencil:");
  var totals = ":video_game: **".concat(totalPugs, "** pug").concat(totalPugs !== 1 ? 's' : '', "\t:cop: **").concat(totalCaptains, "**\t:trophy: **").concat(totalWins, "**\t:x: **").concat(totalLosses, "**");
  var distance = (0, _dateFns.distanceInWordsStrict)(new Date(), last_pug.timestamp, {
    addSuffix: true
  });
  var pugTeams = Array(last_pug.noOfTeams).fill(0).reduce(function (acc, _, i) {
    acc[i] = "\t**".concat(_constants.teams["team_".concat(i)], "** ").concat(_constants.teamEmojis["team_".concat(i)], " ");
    return acc;
  }, {});

  var currTeams = _toConsumableArray(last_pug.players).sort(function (a, b) {
    return a.pick - b.pick;
  }).reduce(function (acc, curr) {
    if (curr.team !== null) acc[curr.team] += "*".concat(curr.username, "* :small_orange_diamond: ");
    return acc;
  }, pugTeams);

  var activeTeams = Object.values(currTeams).reduce(function (acc, curr) {
    acc += "".concat(curr.slice(0, curr.length - 24), "\n");
    return acc;
  }, "");
  var lastMetaData = "Last pug played was **".concat(last_pug.name.toUpperCase(), "** (").concat(distance, ")");
  var collectiveStatsTitle = "__**Gametypes**__";
  var collectiveStatsBody = Object.entries(stats).reduce(function (acc, _ref10, i) {
    var _ref11 = _slicedToArray(_ref10, 2),
        pugName = _ref11[0],
        pugStats = _ref11[1];

    var won = pugStats.won || 0;
    var lost = pugStats.lost || 0;
    var winPercentage = pugStats.won ? pugStats.won / (pugStats.won + pugStats.lost) : 0;
    acc += "**".concat(pugName.toUpperCase(), "**\t**").concat(pugStats.totalPugs, "** pug").concat(pugStats.totalPugs !== 1 ? 's' : '', "\t:cop: **").concat(pugStats.totalCaptain, "**\t:star: ").concat(pugStats.totalRating === 0 ? "**no rating**" : "**".concat(pugStats.totalRating.toFixed(2), "**"), "\t:trophy: **").concat(won, "**\t:x: **").concat(lost, "**\t:muscle: **").concat((winPercentage * 100).toFixed(2), "%**\n");
    return acc;
  }, "");
  return "".concat(title, "\n\n").concat(totals, "\n\n").concat(lastMetaData, "\n").concat(activeTeams, "\n").concat(collectiveStatsTitle, "\n").concat(collectiveStatsBody);
};

exports.formatUserStats = formatUserStats;
//# sourceMappingURL=formats.js.map