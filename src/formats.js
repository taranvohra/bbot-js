import Discord from 'discord.js';
import {
  getPlayerList,
  getMinutesAndSeconds,
  getTeamScores,
  padNumberWithZeros,
  getTeamIndex,
} from './utils';
import { teams, prefix, captainTimeout } from './constants';

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
  richEmbed.setFooter('To query, type .q ip');
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
    }) ${i === list.length - 1 ? '' : ':small_blue_diamond:'}`;
    return acc;
  }, ``);

  return `${title}\n${body}`;
};

export const formatJoinStatus = statuses => {
  const { joined, missed, nf, aj, user } = statuses.reduce(
    (acc, { joined, user, name, activeCount, maxPlayers }) => {
      switch (joined) {
        case -1:
          acc.nf += `No pug found : **${name.toUpperCase()}**\n`;
          break;
        case 0:
          acc.missed += `Sorry, **${name.toUpperCase()}** is already filled\n`;
        case 1:
          acc.joined += `**${name.toUpperCase()}** (${activeCount}/${maxPlayers}) :small_blue_diamond: `;
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
      ? `${user.username} joined :small_blue_diamond: ${joined}`
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
          acc.nj = `Cannot leave pug(s) if you haven't joined :head_bandage:`;
          break;
        case -1:
          acc.nf += `No pug found : **${name.toUpperCase()}**\n`;
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
          isOffline ? `because the person went offline` : ``
        }`
      : ``
  }${nj.length > 0 ? `\n${nj}` : ``}${nf.length > 0 ? `\n${nf}` : ``}`;
  return body;
};

export const formatDeadPugs = deadPugs => {
  const body = deadPugs.reduce((acc, curr, i) => {
    acc += `${
      i > 0 ? `\n` : ``
    } :joy_cat: **${curr.name.toUpperCase()}** was stopped because **${
      curr.user.username
    }** left :joy_cat: `;
    return acc;
  }, ``);
  return body;
};

export const formatBroadcastPug = toBroadcast => {
  const title = `**${toBroadcast.name.toUpperCase()}** has been filled!`;
  const body = toBroadcast.players.reduce((acc, player) => {
    acc += `<@${player.id}> `;
    return acc;
  }, ``);
  const footer = `Type **${prefix}captain** to become a captain for this pug. Random captains will be picked in ${captainTimeout /
    1000} seconds`;

  return `${title}\n${body}${footer}\n`;
};

export const formatListAllCurrentGameTypes = (list, guildName) => {
  const body = list.reduce((prev, curr) => {
    const base = `**${curr.name.toUpperCase()}** (${curr.players.length}/${
      curr.noOfPlayers
    }) `;

    const players = curr.players.reduce((acc, u) => {
      acc += `:small_blue_diamond: ${u.username} `;
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
  const body = `**${user.username}** became captain for **${teams[
    `team_${team}`
  ].toUpperCase()}**`;
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
  for (let i = pug.turn; ; i++) {
    if (pickingOrder[i] !== next.team) break;
    count++;
  }

  const turn = finished
    ? `<@${next.id}> pick ${count} players for **${
        teams[`team_${next.team}`]
      }**`
    : `**Picking has finished`;

  const pugTeams = Array(pug.noOfTeams)
    .fill(0)
    .reduce((acc, _, i) => {
      acc[i] = `**${teams[`team_${i}`]}**: `;
      return acc;
    }, {});

  const players = pug.players.reduce((acc, curr, index) => {
    if (curr.team === null) acc += `**${index + 1}**) *${curr.username}*  `;
    return acc;
  }, `Players: `);

  const currTeams = [...pug.players]
    .sort((a, b) => a.pick - b.pick)
    .reduce((acc, curr) => {
      if (curr.team !== null) acc[curr.team] += `*${curr.username}*  `;
      return acc;
    }, pugTeams);

  const activeTeams = Object.values(currTeams).reduce((acc, curr) => {
    acc += `${curr}\n`;
    return acc;
  }, ``);

  return `${picked}\n${turn}\n${
    finished ? `${players}\n` : ``
  }\n${activeTeams}`;
};

export const formatPugsInPicking = pugsInPicking => {
  const body = pugsInPicking.reduce((acc, pug) => {
    let count = 0;
    const next = pug.captains[pug.pickingOrder[pug.turn]];
    for (let i = pug.turn; ; i++) {
      if (pickingOrder[i] !== next.team) break;
      count++;
    }
    const turn = `<@${next.id}> pick ${count} players for **${
      teams[`team_${next.team}`]
    }**`;

    const pugTeams = Array(pug.noOfTeams)
      .fill(0)
      .reduce((acc, _, i) => {
        acc[i] = `**${teams[`team_${i}`]}**: `;
        return acc;
      }, {});

    const players = pug.players.reduce((acc, curr, index) => {
      if (curr.team === null) acc += `**${index + 1}**) *${curr.username}*  `;
      return acc;
    }, `Players: `);

    const currTeams = [...pug.players]
      .sort((a, b) => a.pick - b.pick)
      .reduce((acc, curr) => {
        if (curr.team !== null) acc[curr.team] += `*${curr.username}*  `;
        return acc;
      }, pugTeams);

    const activeTeams = Object.values(currTeams).reduce((acc, curr) => {
      acc += `${curr}\n`;
      return acc;
    }, ``);

    acc += `${turn}\n\n${players}\n\n${activeTeams}\n\n`;
    return acc;
  }, ``);

  return body;
};

export const formatBroadcastCaptainsReady = ({ players, captains }) => {
  const pugCaptains = captains.reduce((acc, curr, index) => {
    acc += `<@${curr.id}> is the captain for **${teams[`team_${index}`]}**\n`;
    return acc;
  }, ``);

  const turn = `<@${captains[0].id}> pick 1 player for **${teams[`team_0`]}**`;
  const { pugPlayers } = players.reduce(
    (acc, curr, index) => {
      if (curr.captain === null)
        acc.pugPlayers += `**${index + 1}**) *${curr.username}*  `;
      return acc;
    },
    { pugPlayers: `Players: ` }
  );

  return `${pugCaptains}\n${turn}\n${players}`;
};
