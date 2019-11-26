import Discord from 'discord.js';
import {
  getPlayerList,
  getMinutesAndSeconds,
  getTeamScores,
  padNumberWithZeros,
  getTeamIndex,
} from './utils';
import { teams, prefix, captainTimeout, emojis, teamEmojis } from './constants';
import { distanceInWordsStrict } from 'date-fns';

const embedColor = '#11806A';

export const formatQueryServers = list => {
  const richEmbed = new Discord.RichEmbed();

  const description = list.reduce((acc, curr, index) => {
    acc += `\`${index + 1}\`\u00A0\u00A0\u00A0${curr.name}\n`;
    return acc;
  }, '');

  richEmbed.setTitle(`IP\u00A0\u00A0\u00A0Name`);
  richEmbed.setColor(embedColor);
  richEmbed.setDescription(description || 'No game servers added yet');
  richEmbed.setFooter('To query, type: q ip');
  return richEmbed;
};

export const formatQueryServerStatus = (info, players) => {
  const richEmbed = new Discord.RichEmbed();

  const xServerQueryProps = { remainingTime: null, teamScores: {} };
  const playerList = getPlayerList(
    players,
    parseInt(info.numplayers) || 0,
    !!info.maxteams
  );

  if (info.xserverquery) {
    const { minutes, seconds } = getMinutesAndSeconds(
      parseInt(info.remainingtime)
    );
    const teamScores = getTeamScores(info, info.maxteams);
    xServerQueryProps.remainingTime = `${
      (minutes === parseInt(info.timelimit) && seconds === 0) ||
      minutes < parseInt(info.timelimit)
        ? '**Remaining Time:**'
        : '**Overtime**:'
    } ${padNumberWithZeros(minutes)}:${padNumberWithZeros(seconds)} \n`;
    xServerQueryProps.teamScores = Object.keys(teamScores).reduce(
      (acc, curr) => {
        const index = getTeamIndex(curr);
        acc[index] = ` • ${teamScores[curr]}`;
        return acc;
      },
      []
    );
  }

  Object.keys(playerList).forEach(team => {
    const teamIndex = getTeamIndex(team);
    const p = playerList[team];
    const teamPlayers = p.reduce((acc, curr) => {
      if (team == teams.spec) acc += curr + ' • ';
      else acc += curr + ' ' + '\n';
      return acc;
    }, '');

    p.length > 0
      ? richEmbed.addField(
          team + (xServerQueryProps.teamScores[teamIndex] || ``),
          teamPlayers,
          team !== teams.spec
        )
      : '';
  });

  const description = `**Map:** ${info.mapname}\n**Players:** ${
    info.numplayers
  }/${info.maxplayers}\n${xServerQueryProps.remainingTime || ''}`;
  const footerText = `unreal://${info.host}:${info.port}`;

  richEmbed.setTitle(info.hostname);
  richEmbed.setColor(embedColor);
  richEmbed.setDescription(description);
  richEmbed.setFooter(footerText);
  return richEmbed;
};

export const formatListGameTypes = (guildName, list) => {
  const title = `Pugs available at **${guildName}**`;
  const sortedList = list.sort((a, b) => b.players - a.players); // by number of joined players

  const body = sortedList.reduce((acc, curr, i) => {
    acc += `**${curr.name.toUpperCase()}** (${curr.players}/${
      curr.maxPlayers
    }) ${i === list.length - 1 ? '' : ':small_orange_diamond:'}`;
    return acc;
  }, ``);

  return `${title}\n${body}`;
};

export const formatJoinStatus = statuses => {
  const { joined, missed, nf, aj, user } = statuses.reduce(
    (acc, { joined, user, name, activeCount, maxPlayers }) => {
      switch (joined) {
        case -1:
          acc.nf += `No pug found: **${name.toUpperCase()}**\n`;
          break;
        case 0:
          acc.missed += `Sorry, **${name.toUpperCase()}** is already filled ${
            emojis.tearddy
          }\n`;
          break;
        case 1:
          acc.joined += `**${name.toUpperCase()}** (${activeCount}/${maxPlayers}) :small_orange_diamond: `;
          break;
        case 2:
          acc.aj += `**${name.toUpperCase()}** `;
          break;
        default:
          null;
      }
      acc.user = user;
      return acc;
    },
    {
      joined: ``,
      missed: ``,
      nf: ``,
      aj: ``,
      user: null,
    }
  );

  const body = `${
    joined.length > 0
      ? `${user.username} joined :small_orange_diamond: ${joined}`
      : ``
  } ${missed.length > 0 ? `\n${missed}` : ``} ${
    aj.length > 0 ? `\n${user.username}, you have already joined ${aj}` : ``
  } ${nf.length > 0 ? `\n${nf}` : ``}`;

  return body;
};

export const formatLeaveStatus = (statuses, isOffline) => {
  const { left, nj, nf, user } = statuses.reduce(
    (acc, { left, name, user, activeCount, maxPlayers }) => {
      switch (left) {
        case 1:
          acc.left += `${
            acc.left.length > 0 ? `, ` : ``
          }**${name.toUpperCase()}** (${activeCount}/${maxPlayers})`;
          acc.user = user;
          break;
        case 0:
          acc.nj = `Cannot leave pug(s) you haven't joined ${emojis.smart}`;
          break;
        case -1:
          acc.nf += `No pug found: **${name.toUpperCase()}**\n`;
          break;
        default:
          null;
      }
      return acc;
    },
    { user: null, left: ``, nj: ``, nf: `` }
  );

  const body = `${
    left.length > 0
      ? `${user.username} left  ${left} ${
          isOffline
            ? `because the user went offline ${emojis.residentsleeper}${emojis.pupcurn}`
            : ``
        }`
      : ``
  }${nj.length > 0 ? `\n${nj}` : ``}${nf.length > 0 ? `\n${nf}` : ``}`;
  return body;
};

export const formatDeadPugs = deadPugs => {
  const body = deadPugs.reduce((acc, { pug, user }, i) => {
    acc += `${i > 0 ? `\n` : ``} ${
      emojis.peepoComfy
    } **${pug.name.toUpperCase()}** was stopped because **${
      user.username
    }** left ${emojis.peepoComfy}`;
    return acc;
  }, ``);
  return body;
};

export const formatBroadcastPug = toBroadcast => {
  const title = `${
    emojis.moskva
  } :mega: **${toBroadcast.name.toUpperCase()}** has been filled!`;
  const body = toBroadcast.players.reduce((acc, player) => {
    acc += `<@${player.id}> `;
    return acc;
  }, ``);
  const footer = `Type **${prefix}captain** to become a captain for this pug. Random captains will be picked in ${captainTimeout /
    1000} seconds`;

  return `${title}\n${body}\n${footer}\n`;
};

export const formatListGameType = pug => {
  const title = `**${pug.name.toUpperCase()}** (${pug.players.length}/${
    pug.noOfPlayers
  })`;

  const players = pug.players.reduce((acc, u) => {
    acc += `:small_orange_diamond: ${u.username} `;
    return acc;
  }, ``);

  return `${title}${players}`;
};

export const formatListAllCurrentGameTypes = (list, guildName) => {
  const body = list.reduce((prev, curr) => {
    const base = `**${curr.name.toUpperCase()}** (${curr.players.length}/${
      curr.noOfPlayers
    }) `;

    const players = curr.players.reduce((acc, u) => {
      acc += `:small_orange_diamond: ${u.username} `;
      return acc;
    }, ``);

    prev += `${base}${players}\n`;
    return prev;
  }, ``);

  return body
    ? `Listing active pugs at **${guildName}**\n${body}`
    : `There are currently no active pugs, try joining one!`;
};

export const formatAddCaptainStatus = (user, { team }) => {
  const body = `**${user.username}** became captain for ${
    teamEmojis[`team_${team}`]
  } **${teams[`team_${team}`].toUpperCase()}** ${teamEmojis[`team_${team}`]}`;
  return body;
};

export const formatPickPlayerStatus = ({ pickedPlayers, finished, pug }) => {
  const picked = pickedPlayers.reduce((acc, curr) => {
    acc += `<@${curr.player.id}> was picked for **${
      teams[`team_${curr.team}`]
    }**\n`;
    return acc;
  }, ``);

  let count = 0;
  const next = pug.captains[pug.pickingOrder[pug.turn]];

  if (!finished) {
    for (let i = pug.turn; ; i++) {
      if (pug.pickingOrder[i] !== next.team) break;
      count++;
    }
  }

  const turn = finished
    ? `:fire: **Picking has finished** :fire:`
    : `<@${next.id}> pick ${count} player${count > 1 ? 's' : ''} for **${
        teams[`team_${next.team}`]
      }**`;

  const pugTeams = Array(pug.noOfTeams)
    .fill(0)
    .reduce((acc, _, i) => {
      acc[i] = `**${teams[`team_${i}`]}** ${teamEmojis[`team_${i}`]} `;
      return acc;
    }, {});

  const players = pug.players.reduce((acc, curr, index) => {
    if (curr.team === null)
      acc += `**${index + 1})** *${curr.username}* (${
        curr.rating === 0 ? 'no rating' : curr.rating.toFixed(2)
      }) ${curr.tag ? `[${curr.tag}] ` : ''}`;
    return acc;
  }, `Players: `);

  const currTeams = [...pug.players]
    .sort((a, b) => a.pick - b.pick)
    .reduce((acc, curr) => {
      if (curr.team !== null)
        acc[curr.team] += `*${curr.username}* :small_orange_diamond: `;
      return acc;
    }, pugTeams);

  const activeTeams = Object.values(currTeams).reduce((acc, curr) => {
    acc += `${curr.slice(0, curr.length - 24)}\n`;
    return acc;
  }, ``);

  return `${picked}\n${turn}\n${finished ? '' : '\n'}${
    finished ? `` : `${players}\n`
  }\n${activeTeams}`;
};

export const formatPugsInPicking = pugsInPicking => {
  const body = pugsInPicking.reduce((acc, pug) => {
    let count = 0;
    const next = pug.captains[pug.pickingOrder[pug.turn]];
    for (let i = pug.turn; ; i++) {
      if (pug.pickingOrder[i] !== next.team) break;
      count++;
    }
    const turn = `<@${next.id}> pick ${count} player${
      count > 1 ? 's' : ''
    } for **${teams[`team_${next.team}`]}**`;

    const pugTeams = Array(pug.noOfTeams)
      .fill(0)
      .reduce((acc, _, i) => {
        acc[i] = `**${teams[`team_${i}`]}** ${teamEmojis[`team_${i}`]} `;
        return acc;
      }, {});

    const players = pug.players.reduce((acc, curr, index) => {
      if (curr.team === null)
        acc += `**${index + 1})** *${curr.username}* (${
          curr.rating === 0 ? 'no rating' : curr.rating.toFixed(2)
        }) ${curr.tag ? `[${curr.tag}] ` : ''}`;
      return acc;
    }, `Players: `);

    const currTeams = [...pug.players]
      .sort((a, b) => a.pick - b.pick)
      .reduce((acc, curr) => {
        if (curr.team !== null)
          acc[curr.team] += `*${curr.username}* :small_orange_diamond: `;
        return acc;
      }, pugTeams);

    const activeTeams = Object.values(currTeams).reduce((acc, curr) => {
      acc += `${curr.slice(0, curr.length - 24)}\n`;
      return acc;
    }, ``);

    acc += `${turn}\n\n${players}\n\n${activeTeams}\n\n`;
    return acc;
  }, ``);

  return body;
};

export const formatBroadcastCaptainsReady = ({ players, captains }) => {
  const pugCaptains = captains.reduce((acc, curr, index) => {
    acc += `<@${curr.id}> is the captain for ${teamEmojis[`team_${index}`]} **${
      teams[`team_${index}`]
    }** ${teamEmojis[`team_${index}`]}\n`;
    return acc;
  }, ``);

  const turn = `<@${captains[0].id}> pick 1 player for **${teams[`team_0`]}**`;
  const { pugPlayers } = players.reduce(
    (acc, curr, index) => {
      if (curr.captain === null)
        acc.pugPlayers += `**${index + 1})** *${curr.username}* (${
          curr.rating === 0 ? 'no rating' : curr.rating.toFixed(2)
        }) ${curr.tag ? `[${curr.tag}] ` : ''}`;
      return acc;
    },
    { pugPlayers: `Players: ` }
  );

  return `${pugCaptains}\n${turn}\n${pugPlayers}`;
};

export const formatPromoteAvailablePugs = (pugs, guildName) => {
  const title = `@here in **${guildName}**`;
  const body = pugs.reduce((acc, curr) => {
    if (!curr.picking) {
      acc += `**${curr.noOfPlayers -
        curr.players
          .length}** more needed for **${curr.name.toUpperCase()}**\n`;
    }
    return acc;
  }, ``);
  return `${title}\n${body}`;
};

export const formatLastPugStatus = (
  { pug, guildName },
  action,
  timestamp,
  { winner, updated }
) => {
  const distanceInWords = distanceInWordsStrict(new Date(), timestamp, {
    addSuffix: true,
  });
  const title = `${action.charAt(0).toUpperCase() +
    action.slice(
      1
    )} **${pug.name.toUpperCase()}** at **${guildName}** (${distanceInWords})`;

  const pugTeams = Array(pug.noOfTeams)
    .fill(0)
    .reduce((acc, _, i) => {
      acc[i] = `**${teams[`team_${i}`]}** ${teamEmojis[`team_${i}`]} `;
      return acc;
    }, {});

  const currTeams = [...pug.players]
    .sort((a, b) => a.pick - b.pick)
    .reduce((acc, curr) => {
      if (curr.team !== null)
        acc[curr.team] += `*${curr.username}* :small_orange_diamond: `;
      return acc;
    }, pugTeams);

  const activeTeams = Object.values(currTeams).reduce((acc, curr) => {
    acc += `${curr.slice(0, curr.length - 24)}\n`;
    return acc;
  }, ``);

  const result =
    winner !== undefined
      ? `:trophy: ${teamEmojis[`team_${winner}`]} :trophy:`
      : ``;
  return `${
    updated ? `Pug Stat Updated\n\n` : ``
  }${title}\n\n${activeTeams}\n${result}`;
};

export const formatUserStats = ({ username, stats, last_pug }) => {
  const {
    totalPugs,
    totalCaptains,
    totalWins,
    totalLosses,
    totalWinRate,
    totalGameTypes,
  } = Object.values(stats).reduce(
    (acc, curr) => {
      acc.totalPugs += curr.totalPugs || 0;
      acc.totalCaptains += curr.totalCaptain || 0;
      acc.totalWins += curr.won || 0;
      acc.totalLosses += curr.lost || 0;
      return acc;
    },
    {
      totalPugs: 0,
      totalCaptains: 0,
      totalWins: 0,
      totalLosses: 0,
      totalWinRate: 0,
      totalGameTypes: 0,
    }
  );
  const title = `:pencil: Showing stats for **${username}** :pencil:`;
  const totals = `:video_game: **${totalPugs}** pug${
    totalPugs !== 1 ? 's' : ''
  }\t:cop: **${totalCaptains}**\t:trophy: **${totalWins}**\t:x: **${totalLosses}**`;
  const distance = distanceInWordsStrict(new Date(), last_pug.timestamp, {
    addSuffix: true,
  });

  const pugTeams = Array(last_pug.noOfTeams)
    .fill(0)
    .reduce((acc, _, i) => {
      acc[i] = `\t**${teams[`team_${i}`]}** ${teamEmojis[`team_${i}`]} `;
      return acc;
    }, {});

  const currTeams = [...last_pug.players]
    .sort((a, b) => a.pick - b.pick)
    .reduce((acc, curr) => {
      if (curr.team !== null)
        acc[curr.team] += `*${curr.username}* :small_orange_diamond: `;
      return acc;
    }, pugTeams);

  const activeTeams = Object.values(currTeams).reduce((acc, curr) => {
    acc += `${curr.slice(0, curr.length - 24)}\n`;
    return acc;
  }, ``);

  const lastMetaData = `Last pug played was **${last_pug.name.toUpperCase()}** (${distance})`;
  const collectiveStatsTitle = `__**Gametypes**__`;
  const collectiveStatsBody = Object.entries(stats).reduce(
    (acc, [pugName, pugStats], i) => {
      const won = pugStats.won || 0;
      const lost = pugStats.lost || 0;
      const winPercentage = pugStats.won
        ? pugStats.won / (pugStats.won + pugStats.lost)
        : 0;
      acc += `**${pugName.toUpperCase()}**\t**${pugStats.totalPugs}** pug${
        pugStats.totalPugs !== 1 ? 's' : ''
      }\t:cop: **${pugStats.totalCaptain}**\t:star: ${
        pugStats.totalRating === 0
          ? `**no rating**`
          : `**${pugStats.totalRating.toFixed(2)}**`
      }\t:trophy: **${won}**\t:x: **${lost}**\t:muscle: **${(
        winPercentage * 100
      ).toFixed(2)}%**\n`;
      return acc;
    },
    ``
  );

  return `${title}\n\n${totals}\n\n${lastMetaData}\n${activeTeams}\n${collectiveStatsTitle}\n${collectiveStatsBody}`;
};
