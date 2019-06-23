import store from '../store';
import { GameTypes } from '../models';
import {
  computePickingOrder,
  hasPrivilegedRole,
  shuffle,
  getRandomInt,
} from '../utils';
import { privilegedRoles, captainTimeout, offline } from '../constants';
import {
  formatListGameTypes,
  formatJoinStatus,
  formatLeaveStatus,
  formatBroadcastPug,
  formatListAllCurrentGameTypes,
  formatAddCaptainStatus,
} from '../formats';
import { assignGameTypes, addNewPug, removePug } from '../store/actions';

class Pug {
  constructor({ name, noOfPlayers, noOfTeams, pickingOrder }) {
    this.name = name;
    this.noOfPlayers = noOfPlayers;
    this.noOfTeams = noOfTeams;
    this.pickingOrder = pickingOrder;
    this.turn = 0;
    this.picking = false;
    this.players = [];
    this.captains = [];
    this.timer = null;
  }

  // 0 if couldn't join, 1 if joined, 2 if already in
  addPlayer(user) {
    if (!this.picking) {
      if (this.findPlayer(user)) return 2;
      this.players.push({
        team: null,
        captain: null,
        pick: null,
        tag: null,
        rating: 0,
        ...user,
      });
      this.players.length === this.noOfPlayers ? this.fillPug() : null;
      return 1;
    }
    return 0;
  }

  removePlayer(user) {
    const playerIndex = this.players.findIndex(p => p.id === user.id);
    this.players.splice(playerIndex, 1);
    if (this.picking) this.stopPug();
  }

  fillPug() {
    this.picking = true;
    this.timer = setTimeout(() => {
      const remaining = this.noOfPlayers - this.captains.length;
      const playersWithoutCaptain = this.noOfPlayers.filter(
        p => p.captain === null
      );
      const poolForCaptains = shuffle(playersWithoutCaptain)
        .slice(0, remaining * 0.8)
        .sort((a, b) => a.rating - b.rating);

      //  TODO
    }, captainTimeout);
  }

  addCaptain(user) {
    while (1) {
      const teamIndex = getRandomInt(0, this.noOfTeams - 1);
      const didFillSpot = this.fillCaptainSpot(user, teamIndex);
      if (didFillSpot) break;
    }

    if (this.areCaptainsDecided()) clearTimeout(this.timer);
    return {
      team: teamIndex,
      captainsDecided: this.areCaptainsDecided(),
    };
  }

  fillCaptainSpot(user, teamIndex) {
    const pIndex = this.players.findIndex(u => u.id === user.id);
    if (this.players[pIndex].captain === null && !this.captains[teamIndex]) {
      this.players[pIndex].captain = this.players[pIndex].team = teamIndex;
      this.players[pIndex].pick = 0;
      this.captains[teamIndex] = this.players[playerIndex];
      return true;
    }
    return false;
  }

  stopPug() {
    this.cleanup();
  }

  findPlayer(user) {
    return this.players.find(u => u.id === user.id);
  }

  isEmpty() {
    return this.players.length === 0 ? true : false;
  }

  areCaptainsDecided() {
    return this.captains.filter(Boolean).length === this.noOfTeams;
  }

  cleanup() {
    //  TODO
    this.picking = false;
    this.turn = 0;
    this.captains = [];
    this.players.forEach(user => (user.captain = user.team = user.pick = null));
    clearTimeout(this.timer);
  }
}

export const addGameType = async (
  { channel },
  [gameName, noOfPlayers, noOfTeams],
  serverId,
  { roles }
) => {
  try {
    if (!hasPrivilegedRole(privilegedRoles, roles)) return;
    if (isNaN(noOfPlayers) || isNaN(noOfTeams) || !gameName)
      return channel.send('Invalid command');

    const state = store.getState();
    const { gameTypes } = state.pugs[serverId];

    if (gameTypes.some(g => g.name === gameName.toLowerCase()))
      return channel.send('Gametype already exists');

    const pickingOrder = computePickingOrder(
      parseInt(noOfPlayers),
      parseInt(noOfTeams)
    );

    if (!pickingOrder)
      return channel.send(
        'Invalid No. of players/teams. Picking order cannot be computed'
      );

    const newGameType = {
      name: gameName.toLowerCase(),
      pickingOrder,
      noOfPlayers: parseInt(noOfPlayers),
      noOfTeams: parseInt(noOfTeams),
    };

    await GameTypes.findOneAndUpdate(
      { server_id: serverId },
      { $push: { game_types: newGameType } }
    ).exec();
    store.dispatch(
      assignGameTypes({ serverId, gameTypes: [...game_types, newGameType] })
    );

    channel.send(`**${gameName}** has been added`);
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const delGameType = async (
  { channel },
  [gameName, ...rest],
  serverId,
  { roles }
) => {
  try {
    if (!hasPrivilegedRole(privilegedRoles, roles)) return;

    const state = store.getState();
    const { gameTypes } = state.pugs[serverId];

    if (!gameTypes.some(g => g.name === gameName.toLowerCase()))
      return channel.send("Gametype doesn't exist");

    const updatedGameTypes = gameTypes.filter(
      g => g.name !== gameName.toLowerCase()
    );

    await GameTypes.findOneAndUpdate(
      { server_id: serverId },
      { game_types: updatedGameTypes }
    ).exec();
    store.dispatch(assignGameTypes({ serverId, gameTypes: updatedGameTypes }));

    channel.send(`**${gameName}** has been removed`);
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const listGameTypes = async ({ channel }, _, serverId, __) => {
  try {
    const state = store.getState();
    const { pugChannel, gameTypes, list } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(`Active channel for pugs is <#${pugChannel}>`);

    const tempList = gameTypes.map(g => {
      return {
        name: g.name,
        players: 0,
        maxPlayers: g.noOfPlayers,
      };
    });

    const gamesList = tempList.reduce((acc, curr) => {
      const existingPug = list.find(p => p.name === curr.name);
      if (existingPug) {
        acc.push({
          name: existingPug.name,
          maxPlayers: existingPug.noOfPlayers,
          players: existingPug.players.length,
        });
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);

    channel.send(formatListGameTypes(channel.guild.name, gamesList));
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const listAllCurrentGameTypes = async ({ channel }, _, serverId, __) => {
  try {
    const state = store.getState();
    const { pugChannel, list } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(`Active channel for pugs is <#${pugChannel}>`);

    channel.send(formatListAllCurrentGameTypes(list, channel.guild.name));
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const joinGameTypes = async (
  { channel },
  args,
  serverId,
  { id, username, roles }
) => {
  try {
    const state = store.getState();
    const { pugChannel, list, gameTypes } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(`Active channel for pugs is <#${pugChannel}>`);

    // TODO args length 0 (default join with .j)

    if (!id) return channel.send('No user was mentioned');

    const isPartOfFilledPug = list.find(
      p => p.picking && p.players.some(u => u.id === id)
    );

    if (isPartOfFilledPug)
      return channel.send(
        `Please leave **${isPartOfFilledPug.name.toUpperCase()}** first to join other pugs`
      );

    let toBroadcast = null;
    const user = { id, username };
    const statuses = args.map(a => {
      if (!toBroadcast) {
        const game = a.toLowerCase();
        const gameType = gameTypes.find(g => g.name === game);

        if (!gameType) return { user, name: game, joined: -1 }; // -1 is for NOT FOUND

        const existingPug = list.find(p => p.name === game);
        const pug = existingPug || new Pug(gameType);

        const hasFilledBeforeJoining = pug.picking;
        const joined = pug.addPlayer(user);
        const hasFilledAfterJoining = pug.picking;

        if (!hasFilledBeforeJoining && hasFilledAfterJoining) {
          toBroadcast = pug;
        }

        if (!existingPug && joined) {
          store.dispatch(addNewPug({ serverId, newPug: pug }));
        }

        return {
          user,
          joined,
          name: game,
          activeCount: pug.players.length,
          maxPlayers: pug.noOfPlayers,
        };
      }
    });
    channel.send(formatJoinStatus(statuses.filter(Boolean)));
    if (toBroadcast) {
      const allLeaveMsgs = list.reduce((acc, op) => {
        if (op.name !== toBroadcast.name) {
          const allPugLeaveMsgs = toBroadcast.players.reduce((prev, player) => {
            if (op.findPlayer(player)) {
              const msg = leaveGameTypes(
                { channel },
                [op.name],
                serverId,
                user,
                null,
                true
              );
              prev += `${msg} `;
            }
            return prev;
          }, ``);
          acc += `${allPugLeaveMsgs} \n`;
        }
        return acc;
      }, ``);
      allLeaveMsgs && channel.send(allLeaveMsgs);
      channel.send(formatBroadcastPug(toBroadcast));
    }
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const leaveGameTypes = async (
  { channel },
  args,
  serverId,
  { id, username, roles },
  isOffline,
  returnStatus
) => {
  try {
    const state = store.getState();
    const { pugChannel, list, gameTypes } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(`Active channel for pugs is <#${pugChannel}>`);

    if (!id) return channel.send('No user was mentioned');
    if (args.length === 0)
      return channel.send('Invalid, No pugs were mentioned');

    const user = { id, username };
    const statuses = args.map(a => {
      const game = a.toLowerCase();
      const gameType = gameTypes.find(g => g.name === game);

      if (!gameType) return { user, name: game, left: -1 }; // -1 is for NOT FOUND

      const pug = list.find(p => p.name === game);
      const isInPug = pug.findPlayer(user);
      if (isInPug) {
        pug.removePlayer(user);
        return {
          user,
          pug,
          name: game,
          left: 1,
          activeCount: pug.players.length,
          maxPlayers: pug.noOfPlayers,
        };
      }
      return { user, name: game, left: 0 };
    });
    // TODO Compute deadpugs
    const deadPugs = statuses.reduce(
      (acc, { user, pug, name, activeCount, maxPlayers }) => {
        if (activeCount === maxPlayers - 1) {
          acc.push({ pug, user });
        }
        if (pug.isEmpty()) {
          store.dispatch(removePug({ serverId, name }));
        }
        return acc;
      },
      []
    );

    const leaveStatus = formatLeaveStatus(statuses, isOffline);
    if (returnStatus) return leaveStatus;

    channel.send(leaveStatus);
    deadPugs.length > 0 ? channel.send(formatDeadPugs(deadPugs)) : null;
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const leaveAllGameTypes = async (message, args, serverId, user) => {
  try {
    const state = store.getState();
    const { pugChannel, list } = state.pugs[serverId];

    if (pugChannel !== message.channel.id)
      return message.channel.send(
        `Active channel for pugs is <#${pugChannel}>`
      );

    const hasGoneOffline = args[0] === offline;
    const listToLeave = list.reduce((acc, pug) => {
      const isInPug = pug.findPlayer(user);
      if (isInPug) {
        acc.push(pug.name);
      }
      return acc;
    }, []);
    leaveGameTypes(message, listToLeave, serverId, user, hasGoneOffline);
  } catch (error) {
    message.channel.send('Something went wrong');
    console.log(error);
  }
};

export const addCaptain = async (
  { channel },
  args,
  serverId,
  { id, username, roles }
) => {
  try {
    const state = store.getState();
    const { pugChannel, list } = state.pugs[serverId];

    if (pugChannel !== message.channel.id)
      return message.channel.send(
        `Active channel for pugs is <#${pugChannel}>`
      );

    const forWhichPug = list.find(pug => {
      const isCandidate = pug.picking && !pug.areCaptainsDecided();
      if (isCandidate) {
        return pug.players.some(u => u.id === id); // check whether the guy is present there
      }
      return false;
    });

    if (!forWhichPug)
      return channel.send(
        'There was no filled pug for which you could captain'
      );

    if (!forWhichPug.players.some(u => u.id === id && u.captain === null))
      return channel.send(`**${username}** is already a captain`);

    const user = { id, username };
    const result = forWhichPug.addCaptain(user);
    channel.send(formatAddCaptainStatus(user, result));
    // TODO Broadcast captains decided
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};
