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
