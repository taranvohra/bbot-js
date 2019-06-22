import Discord from 'discord.js';
import {
  getPlayerList,
  getMinutesAndSeconds,
  getTeamScores,
  padNumberWithZeros,
  getTeamIndex,
} from './utils';
import { teams } from './constants';

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
