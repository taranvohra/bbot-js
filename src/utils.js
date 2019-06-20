import { teams } from './constants';

export const hasPrivilegedRole = (privilegedRoles, userRoles) =>
  privilegedRoles.some(pr => userRoles.find(ur => ur.name === pr));

/**
 * @param {Object} players
 * @param {Number} noOfPlayers
 * @param {Number} noOfTeams
 */
export const getPlayerList = (players, noOfPlayers, noOfTeams) => {
  const playerList = {
    [teams.team_0]: [],
    [teams.team_1]: [],
    [teams.team_2]: [],
    [teams.team_3]: [],
    [teams.team_255]: [],
    [teams.spec]: [],
  };

  for (let i = 0; i < noOfPlayers; i++) {
    const playerFlag =
      players[`countryc_${i}`] && players[`countryc_${i}`] !== 'none'
        ? `:flag_${players[`countryc_${i}`]}:`
        : `:flag_white:`;

    const player = `${playerFlag} ${sanitizeName(players[`player_${i}`])}`;
    if (players[`mesh_${i}`] === 'Spectator') {
      playerList[teams.spec].push(player);
      continue;
    }

    if (noOfTeams > 0) {
      const team = parseInt(players[`team_${i}`]); // returns an index for the team
      playerList[Object.values(teams)[team]].push(player);
    } else {
      playerList[teams.team_255].push(player);
    }
  }
  return playerList;
};

/**
 * @param {Array} array
 * @description Creates a new object with the even index as key and odd index as the value
 * @returns {Object}
 */
export const createAlternatingObject = array =>
  array.reduce((acc, item, i, arr) => {
    if (i % 2 === 0) acc[item.toLowerCase()] = arr[i + 1];
    return acc;
  }, {});

/**
 * @param {String} name
 * @description Escapes special characters in the name
 * @returns {String}
 */
export const sanitizeName = name => name.replace(/(\*|`|:)/g, c => `\\` + c);

/**
 * @param {Number} time
 * @description Gives minutes and seconds
 * @returns {Object}
 */
export const getMinutesAndSeconds = time => {
  const seconds = time % 60;
  const minutes = (time - seconds) / 60;
  return { seconds, minutes };
};

/**
 * @param {Number} number
 * @description padded with zero(s)
 * @returns {String}
 */
export const padNumberWithZeros = number =>
  number > -1 && number < 10 ? `0${number}` : `${number}`;

/**
 * @param {Object} info
 * @param {Number} maxTeams
 * @description Gives the respective scores for all teams
 * @returns {Object}
 */
export const getTeamScores = (info, maxTeams) => {
  const teamScores = {
    [teams.team_0]: null,
    [teams.team_1]: null,
    [teams.team_2]: null,
    [teams.team_3]: null,
  };

  for (let i = 0; i < maxTeams; i++) {
    teamScores[Object.values(teams)[i]] = info[`teamscore_${i}`];
  }
  return teamScores;
};

/**
 * @param {String} teamName
 * @description Returns the index for the team
 * @returns {Number}
 */
export const getTeamIndex = teamName =>
  Object.values(teams).findIndex(t => t === teamName);
