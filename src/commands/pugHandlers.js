import store from '../store';
import { GameTypes, Pugs, Users, Blocks } from '../models';
import {
  computePickingOrder,
  hasPrivilegedRole,
  shuffle,
  getRandomInt,
  sanitizeName,
  hasCoolDownRole,
} from '../utils';
import {
  privilegedRoles,
  captainTimeout,
  offline,
  pugEvents,
  tagLength,
  prefix,
  emojis,
  strongPlayerRatingThreshold,
  teamIndexes,
  coolDownRoles,
  coolDownSeconds,
} from '../constants';
import {
  formatListGameTypes,
  formatJoinStatus,
  formatLeaveStatus,
  formatBroadcastPug,
  formatListAllCurrentGameTypes,
  formatAddCaptainStatus,
  formatPugsInPicking,
  formatDeadPugs,
  formatPickPlayerStatus,
  formatPromoteAvailablePugs,
  formatLastPugStatus,
  formatUserStats,
  formatListGameType,
} from '../formats';
import {
  assignGameTypes,
  addNewPug,
  removePug,
  addBlock,
  removeBlock,
  initCmdCooldown,
} from '../store/actions';
import events from 'events';
import fs from 'fs';
import Jimp from 'jimp';
import { FONTS } from '../fonts';

export const pugEventEmitter = new events.EventEmitter();

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
        rating: user.stats[this.name] ? user.stats[this.name].totalRating : 0,
        ...user,
      });
      return 1;
    }
    return 0;
  }

  removePlayer(user) {
    const playerIndex = this.players.findIndex(p => p.id === user.id);
    this.players.splice(playerIndex, 1);
    if (this.picking) this.stopPug();
  }

  fillPug(serverId) {
    this.picking = true;
    this.timer = setTimeout(() => {
      const remaining = this.noOfPlayers - this.captains.length;
      const playersWithoutCaptain = this.players.filter(
        p => p.captain === null
      );
      const poolForCaptains = shuffle(playersWithoutCaptain)
        .slice(0, remaining * 0.6)
        .sort((a, b) => a.rating - b.rating);

      if (this.noOfTeams === 2) {
        if (this.captains.length === 0) {
          let leastDiff = Number.MAX_SAFE_INTEGER;
          let pair = [0, 1];
          for (let i = 1; i < poolForCaptains.length - 1; i++) {
            const left = {
              pair: [i, i - 1],
              diff: Math.abs(
                poolForCaptains[i].rating - poolForCaptains[i - 1].rating
              ),
            };
            const right = {
              pair: [i, i + 1],
              diff: Math.abs(
                poolForCaptains[i].rating - poolForCaptains[i + 1].rating
              ),
            };

            const smallest = Math.min(left.diff, right.diff);
            if (smallest === left.diff && smallest <= leastDiff) {
              leastDiff = left.diff;
              pair = left.pair;
            } else if (smallest === right.diff && smallest <= leastDiff) {
              leastDiff = right.diff;
              pair = right.pair;
            }
          }
          const firstCaptain = poolForCaptains[pair[0]];
          const secondCaptain = poolForCaptains[pair[1]];

          let strongCaptain, weakCaptain; // with respect to each other
          if (firstCaptain.rating <= secondCaptain.rating) {
            strongCaptain = firstCaptain;
            weakCaptain = secondCaptain;
          } else {
            strongCaptain = secondCaptain;
            weakCaptain = firstCaptain;
          }

          const strongPlayersCount = this.players.reduce((acc, user) => {
            if (user.rating <= strongPlayerRatingThreshold) acc = acc + 1;
            return acc;
          }, 0);

          const strongPlayerPercentage =
            strongPlayersCount / this.players.length;

          // 4-5 strong players
          if (strongPlayerPercentage >= 0.4 && strongPlayerPercentage <= 0.5) {
            this.fillCaptainSpot(strongCaptain, 0);
            this.fillCaptainSpot(weakCaptain, 1);
          } else if (
            strongPlayerPercentage < 0.4 ||
            strongPlayerPercentage > 0.5
          ) {
            // less than 4 strong players total in the pug or more than 5 strong players
            this.fillCaptainSpot(weakCaptain, 0);
            this.fillCaptainSpot(strongCaptain, 1);
          }
        } else {
          // 1 capt already there
          const firstCaptain = this.players.find(u => u.captain !== null);
          let leastDiff = 10000;
          let otherCaptainIndex = null;
          for (let i = 0; i < poolForCaptains.length; i++) {
            const diff = Math.abs(
              firstCaptain.rating - poolForCaptains[i].rating
            );
            if (diff <= leastDiff) {
              leastDiff = diff;
              otherCaptainIndex = i;
            }
          }

          const otherCaptain = poolForCaptains[otherCaptainIndex];
          const otherCaptainTeam = Math.abs((firstCaptain.team % 2) - 1);
          this.fillCaptainSpot(otherCaptain, otherCaptainTeam);
        }
      } else {
        // more than 2 capts
        for (let i = 0; i < this.noOfTeams; i++) {
          if (this.captains[i]) continue;
          while (1) {
            const pIndex = getRandomInt(0, poolForCaptains.length - 1);
            const didFillSpot = this.fillCaptainSpot(
              poolForCaptains[pIndex],
              i
            );
            if (didFillSpot) break;
          }
        }
      }

      pugEventEmitter.emit(pugEvents.captainsReady, serverId, this.name);
      //  TODO
    }, captainTimeout);
  }

  addCaptain(user) {
    let teamIndex;
    while (1) {
      teamIndex = getRandomInt(0, this.noOfTeams - 1);
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
      this.captains[teamIndex] = this.players[pIndex];
      return true;
    }
    return false;
  }

  pickPlayer(playerIndex, team) {
    if (this.players[playerIndex].team === null) {
      this.players[playerIndex].team = team;
      this.turn += 1;
      this.players[playerIndex].pick = this.turn;

      let pickedPlayers = [{ player: this.players[playerIndex], team }];
      // last pick automatically goes
      if (this.turn === this.pickingOrder.length - 1) {
        const lastPlayerIndex = this.players.findIndex(u => u.team === null);
        const lastPlayerTeam = this.pickingOrder[this.turn];

        this.players[lastPlayerIndex].team = lastPlayerTeam;
        this.turn += 1;
        this.players[lastPlayerIndex].pick = this.turn;
        // pug ends
        this.picking = false;
        pickedPlayers.push({
          player: this.players[lastPlayerIndex],
          team: lastPlayerTeam,
        });
        return {
          pickedPlayers,
          finished: true,
        };
      }
      return {
        pickedPlayers,
        finished: false,
      };
    }
  }

  addTag(user, tag) {
    this.players.forEach(u => {
      if (u.id === user.id) {
        u.tag = tag;
      }
    });
  }

  removeTag(user) {
    this.players.forEach(u => {
      if (u.id === user.id) {
        u.tag = null;
      }
    });
  }

  resetPug(serverId) {
    this.stopPug();
    this.fillPug(serverId);
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
      assignGameTypes({ serverId, gameTypes: [...gameTypes, newGameType] })
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

export const listGameTypes = async ({ channel }, [gameType], serverId, __) => {
  try {
    const state = store.getState();
    const { pugChannel, gameTypes, list } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        }`
      );

    if (gameType) {
      const validGameType = gameTypes.find(
        g => g.name === gameType.toLowerCase()
      );
      if (!validGameType)
        return channel.send(`There is no such active pug: **${gameType}**`);

      const existingPug = list.find(p => p.name === gameType.toLowerCase());
      if (!existingPug)
        return channel.send(
          `**${gameType.toUpperCase()}** (0/${validGameType.noOfPlayers})`
        );

      channel.send(formatListGameType(existingPug));
    } else {
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
    }
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
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

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
  { id, username, roles, isInvisible, client }
) => {
  try {
    const state = store.getState();
    const { pugChannel, list, gameTypes } = state.pugs[serverId];
    const { list: blockedList } = state.blocks[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    // TODO args length 0 (default join with .j)
    if (isInvisible)
      return channel.send(`Cannot use this command while invisible`);

    if (!id) return channel.send('No user was mentioned');

    if (blockedList.some(u => u.id === id))
      return channel.send(`Not allowed to join pugs`);

    const isPartOfFilledPug = list.find(
      p => p.picking && p.players.some(u => u.id === id)
    );

    if (isPartOfFilledPug)
      return channel.send(
        `Please leave **${isPartOfFilledPug.name.toUpperCase()}** first to join other pugs`
      );

    const db_user = await Users.findOne({ server_id: serverId, id: id }).exec();

    let toBroadcast = null;
    const user = {
      id,
      username,
      stats: db_user && db_user.stats ? db_user.stats : {},
    };
    const statuses = args.map(a => {
      if (!toBroadcast) {
        const game = a.toLowerCase();
        const gameType = gameTypes.find(g => g.name === game);

        if (!gameType) return { user, name: game, joined: -1 }; // -1 is for NOT FOUND

        const existingPug = list.find(p => p.name === game);
        const pug = existingPug || new Pug(gameType);

        const hasFilledBeforeJoining = pug.picking;
        const joined = pug.addPlayer(user);
        pug.players.length === pug.noOfPlayers && !pug.picking
          ? pug.fillPug(serverId)
          : null;
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
      let allLeaveMsgs = ``;
      for (let i = 0; i < list.length; i++) {
        const op = list[i];
        if (op.name !== toBroadcast.name) {
          let allPugLeaveMsgs = ``;
          for (let j = 0; j < toBroadcast.players.length; j++) {
            const player = toBroadcast.players[j];
            if (op.findPlayer(player)) {
              const msg = await leaveGameTypes(
                { channel },
                [op.name],
                serverId,
                player,
                null,
                true
              );
              allPugLeaveMsgs += `${msg} `;
            }
          }
          allLeaveMsgs += `${allPugLeaveMsgs} \n`;
        }
      }

      allLeaveMsgs && channel.send(allLeaveMsgs);
      channel.send(formatBroadcastPug(toBroadcast));

      // Send DM to each user
      const DM_title = `**${toBroadcast.name.toUpperCase()}** filled in **${
        channel.guild.name
      }**. Players are,`;
      const DM_body = toBroadcast.players.reduce((acc, curr) => {
        acc += `:small_blue_diamond: ${curr.username} `;
        return acc;
      }, ``);

      toBroadcast.players.forEach(player => {
        const user = client.users.get(player.id);
        if (user) {
          user.send(`${DM_title}\n${DM_body}`);
        }
      });
    }
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const setDefaultJoin = async (
  { channel },
  args,
  serverId,
  { id, username }
) => {
  try {
    const state = store.getState();
    const { pugChannel, gameTypes } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    const allJoins = args.map(a => {
      const game = a.toLowerCase();
      const gameType = gameTypes.find(g => g.name === game);

      if (!gameType) return undefined;
      return game;
    });

    const defaultJoins = allJoins.filter(Boolean);
    if (defaultJoins.length > 0) {
      await Users.findOneAndUpdate(
        { id, server_id: serverId },
        {
          $set: {
            server_id: serverId,
            default_joins: defaultJoins,
            id,
            username,
          },
        },
        {
          upsert: true,
        }
      ).exec();

      channel.send('Default join set!');
    }
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const decideDefaultOrJoin = async (
  { channel },
  args,
  serverId,
  { id, username, roles, isInvisible, client }
) => {
  try {
    const state = store.getState();
    const { pugChannel, list } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );
    // like .j siege5 or .join 4way
    if (args.length > 0) {
      return joinGameTypes({ channel }, args, serverId, {
        id,
        username,
        roles,
        isInvisible,
        client,
      });
    }

    // just .j case
    const db_user = await Users.findOne({ server_id: serverId, id: id }).exec();

    if (
      !db_user ||
      !db_user.default_joins ||
      db_user.default_joins.length === 0
    )
      return channel.send(
        `No defaultjoin set. Type **${prefix}defaultjoin gametypes** to set it!`
      );

    return joinGameTypes({ channel }, db_user.default_joins, serverId, {
      id,
      username,
      roles,
      isInvisible,
      client,
    });
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
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    if (!id) return channel.send('No user was mentioned');
    if (args.length === 0)
      return channel.send('Invalid, No pugs were mentioned');

    const user = { id, username };
    const statuses = args.map(a => {
      const game = a.toLowerCase();
      const gameType = gameTypes.find(g => g.name === game);

      if (!gameType) return { user, name: game, left: -1 }; // -1 is for NOT FOUND

      const pug = list.find(p => p.name === game);
      const isInPug = pug && pug.findPlayer(user);
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
        if (pug && pug.isEmpty()) {
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
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    const hasGoneOffline = args[0] === offline;
    const listToLeave = list.reduce((acc, pug) => {
      const isInPug = pug.findPlayer(user);
      if (isInPug) {
        acc.push(pug.name);
      }
      return acc;
    }, []);
    if (listToLeave.length === 0) {
      return message.channel.send(
        `Cannot leave pug(s) if you haven't joined any ${emojis.smart}`
      );
    }
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

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
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
    if (result.captainsDecided) {
      // emit
      pugEventEmitter.emit(pugEvents.captainsReady, serverId, forWhichPug.name);
    }
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const pickPlayer = async (
  { channel },
  [index, ...args],
  serverId,
  { id, username, roles }
) => {
  try {
    const state = store.getState();
    const { pugChannel, list } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    const playerIndex = parseInt(index);
    if (!playerIndex) return;

    const forWhichPug = list.find(pug => {
      if (pug.picking) {
        return pug.players.some(u => u.id === id && u.captain !== null); // check whether the guy is present there
      }
      return false;
    });

    if (!forWhichPug)
      return channel.send(
        `Cannot pick if you are not a captain in a pug ${emojis.smart} `
      );

    if (!forWhichPug.areCaptainsDecided())
      return channel.send('Please wait until all captains have been decided');

    const { team } = forWhichPug.players.find(
      u => (u.id === id) & (u.captain !== null)
    );
    const { pickingOrder, turn, name } = forWhichPug;

    if (team !== pickingOrder[turn])
      return channel.send('Please wait for your turn :pouting_cat: ');

    if (playerIndex < 1 || playerIndex > forWhichPug.players.length)
      return channel.send('Invalid pick');

    if (forWhichPug.players[playerIndex - 1].team !== null) {
      const alreadyPicked = forWhichPug.players[playerIndex - 1];
      return channel.send(`${alreadyPicked.username} is already picked`);
    }

    const result = forWhichPug.pickPlayer(playerIndex - 1, pickingOrder[turn]);
    channel.send(formatPickPlayerStatus({ ...result, pug: forWhichPug }));

    // SAVE STATS
    if (result.finished) {
      new Pugs({
        server_id: serverId,
        name: forWhichPug.name,
        pug: forWhichPug,
        timestamp: new Date(),
      }).save();

      const players = forWhichPug.players;

      Users.bulkWrite(
        players.map(({ id, username, pick, captain, stats }) => {
          const existingStats = stats[forWhichPug.name];

          if (!existingStats) {
            const totalRating = pick;
            const totalCaptain = captain !== null ? 1 : 0;
            const totalPugs = 1;
            return {
              updateOne: {
                filter: { id, server_id: serverId },
                update: {
                  $set: {
                    username,
                    last_pug: { ...forWhichPug, timestamp: new Date() },
                    [`stats.${forWhichPug.name}.totalRating`]: totalRating,
                    [`stats.${forWhichPug.name}.totalCaptain`]: totalCaptain,
                    [`stats.${forWhichPug.name}.totalPugs`]: totalPugs,
                  },
                },
                upsert: true,
              },
            };
          } else {
            const totalRating =
              captain !== null
                ? existingStats.totalRating
                : (existingStats.totalRating *
                    (existingStats.totalPugs - existingStats.totalCaptain) +
                    pick) /
                  (existingStats.totalPugs - existingStats.totalCaptain + 1);
            const totalCaptain =
              captain !== null
                ? existingStats.totalCaptain + 1
                : existingStats.totalCaptain;
            const totalPugs = existingStats.totalPugs + 1;

            return {
              updateOne: {
                filter: { id, server_id: serverId },
                update: {
                  $set: {
                    username,
                    last_pug: { ...forWhichPug, timestamp: new Date() },
                    [`stats.${forWhichPug.name}.totalRating`]: totalRating,
                    [`stats.${forWhichPug.name}.totalCaptain`]: totalCaptain,
                    [`stats.${forWhichPug.name}.totalPugs`]: totalPugs,
                  },
                },
                upsert: true,
              },
            };
          }
        }),
        { ordered: false }
      );

      store.dispatch(removePug({ serverId, name }));
    }
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const pugPicking = async ({ channel }, _, serverId, __) => {
  try {
    const state = store.getState();
    const { pugChannel, list } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    const pugsInPicking = list.filter(
      pug => pug.picking && pug.areCaptainsDecided()
    );

    if (pugsInPicking.length === 0) {
      return channel.send('There are no pugs in picking mode');
    }

    channel.send(formatPugsInPicking(pugsInPicking));
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const promoteAvailablePugs = async (
  { channel },
  args,
  serverId,
  { roles }
) => {
  try {
    const state = store.getState();
    const { pugChannel, list } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    // Check if command is in cooldown mode for that role
    if (hasCoolDownRole(coolDownRoles, roles)) {
      const { cooldown } = state.globals[serverId];
      const timeDiff = cooldown.promote - Date.now();
      if (cooldown.promote !== undefined && timeDiff > 0) {
        return channel.send(
          `COOLDOWN! You will be able to use this command after ${(
            timeDiff / 1000
          ).toFixed(0)} second${timeDiff / 1000 > 1 ? `s` : ``}`
        );
      }
    }

    const hasPugMentioned =
      args[0] && list.find(p => p.name === args[0].toLowerCase());

    if (
      hasPugMentioned &&
      hasPugMentioned.players.length > 0 &&
      !hasPugMentioned.picking
    )
      return channel.send(
        formatPromoteAvailablePugs([hasPugMentioned], channel.guild.name)
      );

    // Save cooldown expiry timestamp in redux store
    if (hasCoolDownRole(coolDownRoles, roles)) {
      store.dispatch(
        initCmdCooldown({
          serverId,
          command: 'promote',
          timestamp: Date.now() + coolDownSeconds * 1000,
        })
      );
    }

    !hasPugMentioned && list.length > 0
      ? channel.send(formatPromoteAvailablePugs(list, channel.guild.name))
      : channel.send('There are no active pugs to promote. Try joining one!');
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const checkLastPugs = async (
  { channel },
  args,
  serverId,
  { action }
) => {
  try {
    const state = store.getState();
    const { pugChannel, list, gameTypes } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    const { tCount, digits } = action.split('').reduce(
      (acc, curr) => {
        acc.tCount += curr === 't' ? 1 : 0;
        acc.digits += curr.match(/\d/g) ? curr : '';
        return acc;
      },
      { tCount: 0, digits: '' }
    );

    if (tCount > 1 && parseInt(digits) > 0)
      return channel.send('Invalid command');

    const howMany = parseInt(digits) > 0 ? parseInt(digits) : tCount;

    const pugArg = args[0] && args[0].toLowerCase();
    let results = null;
    if (pugArg) {
      results = await Pugs.find({ server_id: serverId, name: pugArg })
        .sort({ timestamp: -1 })
        .limit(1)
        .skip(howMany - 1)
        .exec();
    } else {
      results = await Pugs.find({ server_id: serverId })
        .sort({ timestamp: -1 })
        .limit(1)
        .skip(howMany - 1)
        .exec();
    }

    if (!results || results.length === 0)
      return channel.send(
        `No ${action} pug found ${
          pugArg ? `for **${pugArg.toUpperCase()}**` : ``
        }`
      );

    const found = results[0];
    found &&
      channel.send(
        formatLastPugStatus(
          { pug: found.pug, guildName: channel.guild.name },
          action,
          found.timestamp,
          { winner: found.winner }
        )
      );
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const resetPug = async ({ channel }, args, serverId, { roles }) => {
  if (!hasPrivilegedRole(privilegedRoles, roles)) return;

  const state = store.getState();
  const { pugChannel, list } = state.pugs[serverId];

  if (pugChannel !== channel.id)
    return channel.send(
      `Active channel for pugs is ${
        pugChannel ? `<#${pugChannel}>` : `not present`
      } <#${pugChannel}>`
    );

  const pugName = args[0].toLowerCase();
  const forWhichPug = list.find(p => p.name === pugName);

  if (!forWhichPug)
    return channel.send(`No pug found: **${args[0].toUpperCase()}**`);
  if (!forWhichPug.picking)
    return channel.send(
      `**${forWhichPug.name.toUpperCase()}** is not in picking mode yet`
    );

  forWhichPug.resetPug(serverId);
  channel.send(formatBroadcastPug(forWhichPug));
};

export const decidePromoteOrPick = async (
  { channel },
  args,
  serverId,
  { id, username, action, roles }
) => {
  try {
    const state = store.getState();
    const { pugChannel, list } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    // just p or promote
    if (['p', 'promote'].includes(action) && !args[0])
      return promoteAvailablePugs({ channel }, args, serverId, {
        id,
        username,
        roles,
      });

    // p 4 or pick 7 or p siege5
    if (['p', 'pick'].includes(action) && args[0]) {
      // p 4 or p siege5
      if (action === 'p') {
        if (isNaN(args[0])) {
          return promoteAvailablePugs({ channel }, args, serverId, {
            id,
            username,
            roles,
          });
        }
        return pickPlayer({ channel }, args, serverId, { id, username });
      } else {
        return pickPlayer({ channel }, args, serverId, { id, username });
      }
    }
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const checkStats = async (
  { channel },
  args,
  serverId,
  { id, username, mentionedUser }
) => {
  try {
    const state = store.getState();
    const { pugChannel } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    const user = await Users.findOne({
      server_id: serverId,
      id: mentionedUser ? mentionedUser.id : id,
    }).exec();

    if (!user || !user.stats) {
      return channel.send(
        `There are no stats logged for **${
          mentionedUser ? mentionedUser.username : username
        }**`
      );
    }

    channel.send(formatUserStats(user));
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const addOrRemoveTag = async (
  { channel },
  args,
  serverId,
  { id, username }
) => {
  try {
    const state = store.getState();
    const { pugChannel, list } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    let tag = '';
    const isAddingTag = Boolean(args[0]);

    if (isAddingTag && args.join(' ').length > tagLength)
      return channel.send(`Tags must be shorter than ${tagLength} characters`);

    tag = sanitizeName(args.join(' '));

    const whichPugs = list.filter(pug => pug.findPlayer({ id, username }));

    if (whichPugs.length === 0) return;

    whichPugs.forEach(pug => {
      isAddingTag
        ? pug.addTag({ id, username }, tag)
        : pug.removeTag({ id, username });
    });

    isAddingTag
      ? channel.send(`Your new tag is: **${tag}**`)
      : channel.send(`Your tag has been removed`);
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

/**
 * A D M I N
 * C O M M A N D S
 */

export const adminAddPlayer = async (
  { channel },
  args,
  serverId,
  { mentionedUser, roles, client }
) => {
  try {
    const state = store.getState();
    const { pugChannel } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    if (!hasPrivilegedRole(privilegedRoles, roles)) return;
    if (!mentionedUser) return channel.send('No mentioned user');

    joinGameTypes({ channel }, args.slice(1), serverId, {
      id: mentionedUser.id,
      username: mentionedUser.username,
      client,
    });
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const adminRemovePlayer = async (
  { channel },
  args,
  serverId,
  { mentionedUser, roles }
) => {
  try {
    const state = store.getState();
    const { pugChannel } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    if (!hasPrivilegedRole(privilegedRoles, roles)) return;
    if (!mentionedUser) return channel.send('No mentioned user');

    leaveGameTypes({ channel }, args.slice(1), serverId, {
      id: mentionedUser.id,
      username: mentionedUser.username,
    });
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const adminPickPlayer = async (
  { channel },
  args,
  serverId,
  { mentionedUser, roles }
) => {
  try {
    const state = store.getState();
    const { pugChannel } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    if (!hasPrivilegedRole(privilegedRoles, roles)) return;
    if (!mentionedUser) return channel.send('No mentioned user');

    pickPlayer({ channel }, args.slice(1), serverId, {
      id: mentionedUser.id,
      username: mentionedUser.username,
    });
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const blockPlayer = async (
  { channel },
  args,
  serverId,
  { id, username, roles, mentionedUser }
) => {
  try {
    const state = store.getState();
    const { pugChannel, list: pugList } = state.pugs[serverId];
    const { list } = state.blocks[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    if (!hasPrivilegedRole(privilegedRoles, roles)) return;
    if (!mentionedUser) return channel.send('No mentioned user');

    if (list.some(u => u.id === mentionedUser.id))
      return channel.send(
        `${mentionedUser.username} is already blocked from pugs`
      );

    const [timeframe, ...reason] = args.slice(1);
    const [blockLengthString] = timeframe.match(/[0-9]+/g);
    const [blockPeriodString] = timeframe.match(/[m|h|d]/g);
    if (!blockLengthString || !blockPeriodString)
      return channel.send('Please mention the length of the block');

    const blockCalculator = {
      m: minutes => {
        const dt = new Date();
        dt.setMinutes(dt.getMinutes() + minutes);
        return dt;
      },
      h: hours => {
        const dt = new Date();
        dt.setHours(dt.getHours() + hours);
        return dt;
      },
      d: days => {
        const dt = new Date();
        dt.setHours(dt.getHours() + days * 24);
        return dt;
      },
    };
    const blockLength = parseInt(blockLengthString);
    if (blockLength < 0) return;

    const expirationDate = blockCalculator[blockPeriodString](blockLength);
    const newBlockedUser = {
      id: mentionedUser.id,
      username: mentionedUser.username,
      blocked_on: new Date(),
      expires_at: expirationDate,
      reason: reason.join(' ') || '',
    };

    await Blocks.findOneAndUpdate(
      { server_id: serverId },
      { $set: { blocked_users: newBlockedUser } },
      { upsert: true }
    );
    store.dispatch(addBlock({ serverId, blockedUser: newBlockedUser }));

    // remove from pugs if joined
    let removedMsg = ``;
    let removedPugs = ``;
    for (let i = 0; i < pugList.length; i++) {
      if (pugList[i].findPlayer({ id: mentionedUser.id })) {
        await leaveGameTypes(
          { channel },
          [pugList[i].name],
          serverId,
          { id: mentionedUser.id, username: mentionedUser.username },
          null,
          true
        );
        removedPugs += `**${pugList[i].name.toUpperCase()}** `;
      }
    }

    if (removedPugs) {
      removedMsg = `**${mentionedUser.username}** was removed from ${removedPugs}`;
    }

    const finalMsg = `${emojis.bannechu} **${
      mentionedUser.username
    }** has been blocked from joining pugs till __**${expirationDate.toGMTString()}**__ ${
      emojis.bannechu
    }\n${removedMsg}`;

    channel.send(finalMsg);
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const unblockPlayer = async (
  { channel },
  args,
  serverId,
  { id, username, roles, mentionedUser, isBot }
) => {
  try {
    const state = store.getState();
    const { pugChannel } = state.pugs[serverId];
    const { list } = state.blocks[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    if (!hasPrivilegedRole(privilegedRoles, roles) && !isBot) return;
    if (!mentionedUser) return channel.send('No mentioned user');

    if (!list.some(u => u.id === mentionedUser.id))
      return channel.send(
        `cannot unblock **${mentionedUser.username}** if the user isn't blocked in the first place ${emojis.smart} `
      );

    const newBlockedList = list.filter(u => u.id !== mentionedUser.id);
    await Blocks.findOneAndUpdate(
      { server_id: serverId },
      { $set: { blocked_users: newBlockedList } },
      { upsert: true }
    );
    store.dispatch(
      removeBlock({ serverId, unblockedUserId: mentionedUser.id })
    );

    channel.send(`**${mentionedUser.username}** has been unblocked`);
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};

export const showBlockedUsers = async (
  message,
  _,
  serverId,
  { id, username, roles }
) => {
  try {
    const state = store.getState();
    const { pugChannel } = state.pugs[serverId];
    const { list = [] } = state.blocks[serverId];

    if (pugChannel !== message.channel.id)
      return message.channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    if (!hasPrivilegedRole(privilegedRoles, roles)) return;

    if (list.length === 0) {
      message.author.send('There are no blocked users');
      return message.channel.send('You have received a DM');
    }

    const msg = list.reduce((acc, curr, i) => {
      acc += `${i > 0 ? ' • ' : ''} **${curr.username}** ${
        curr.reason ? `(${curr.reason}) ` : ``
      }block expires on **${curr.expires_at.toGMTString()}**`;
      return acc;
    }, ``);

    message.author.send(
      `${emojis.bannechu} List of Blocked Users ${emojis.bannechu}\n${msg}`
    );
    message.channel.send('You have received a DM');
  } catch (error) {
    message.channel.send('Something went wrong');
    console.log(error);
  }
};

export const declareWinner = async (
  { channel },
  [which, wTeam],
  serverId,
  { id, username, roles }
) => {
  try {
    const state = store.getState();
    const { pugChannel } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        }`
      );

    if (!hasPrivilegedRole(privilegedRoles, roles)) return;

    const { tCount, digits } = which.split('').reduce(
      (acc, curr) => {
        acc.tCount += curr === 't' ? 1 : 0;
        acc.digits += curr.match(/\d/g) ? curr : '';
        return acc;
      },
      { tCount: 0, digits: '' }
    );

    if (tCount > 1 && parseInt(digits) > 0)
      return channel.send('Invalid command');

    const howMany = parseInt(digits) > 0 ? parseInt(digits) : tCount;

    const results = await Pugs.find({ server_id: serverId })
      .sort({ timestamp: -1 })
      .limit(1)
      .skip(howMany - 1)
      .exec();

    if (!results || results.length === 0)
      return channel.send(`No **${which}** pug found`);

    const found = results[0];
    if (!found) return channel.send(`No **${which}** pug found`);

    let changeWinner = false;
    const { pug } = found;
    const winningTeam = teamIndexes[wTeam.toLowerCase()];

    if (winningTeam === undefined || winningTeam > pug.noOfTeams - 1)
      return channel.send('Invalid winning team');

    if (found.winner === winningTeam)
      return channel.send('Pug winner already set');

    if (found.winner !== undefined) changeWinner = true; // change the previously set winner

    const updatedPug = await Pugs.findOneAndUpdate(
      { _id: found.id },
      { $set: { winner: winningTeam } },
      { new: true }
    ).exec();

    // todo, if same team winner, skip it, if different then reverse wins and loss
    await Users.bulkWrite(
      pug.players.map(({ id, team, username }) => {
        return {
          updateOne: {
            filter: { id, server_id: serverId },
            update: {
              $inc: {
                [`stats.${pug.name}.won`]:
                  team === winningTeam ? 1 : changeWinner ? -1 : 0,
                [`stats.${pug.name}.lost`]:
                  team !== winningTeam ? 1 : changeWinner ? -1 : 0,
              },
              $set: { username },
            },
          },
        };
      }),
      {
        ordered: false,
      }
    );

    channel.send(
      formatLastPugStatus(
        { pug: updatedPug.pug, guildName: channel.guild.name },
        which,
        found.timestamp,
        { winner: winningTeam, updated: true }
      )
    );
  } catch (error) {
    console.log(error);
    message.channel.send('Something went wrong');
  }
};

export const getTop10 = async ({ channel }, [gameTypeArg], serverId, _) => {
  try {
    const state = store.getState();
    const { pugChannel, gameTypes } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        }`
      );

    if (!gameTypeArg)
      return channel.send('Invalid! specify the gametype aswell');

    const gameType = gameTypes.find(g => g.name === gameTypeArg.toLowerCase());
    if (!gameType)
      return channel.send(
        `**${gameTypeArg.toUpperCase()}** is not a registered gametype`
      );

    const allPlayers = await Users.find(
      { server_id: serverId },
      { username: 1, stats: 1 }
    );

    const gameTypeName = gameTypeArg.toLowerCase();
    const top10 = allPlayers
      .map(({ username, stats }) => {
        if (!stats || !stats[gameTypeName]) return undefined;

        const { won, lost, totalRating } = stats[gameTypeName];
        if (won + lost < 3) return undefined; // must have atleast 3 games to be considered

        const winP = won / (won + lost);
        const points = (1 + 0.015 * winP * 100) * (1 + 1.5 / totalRating);
        if (isNaN(points)) return undefined;

        return {
          username,
          points,
          stats: stats[gameTypeName],
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);

    Jimp.read('assets/top10_template.png').then(async template => {
      const { arialFNT, ubuntuFNT, ubuntuTTF } = await FONTS;
      let Y = 50;
      const MAX_HEIGHT = 25;

      top10.forEach(player => {
        const {
          username,
          stats: { totalPugs, totalRating, won, lost },
        } = player;
        const winP = `${((won / (won + lost)) * 100).toFixed(0)}%`;

        const name = username.replace(/\\[^\\]/g, c => c.substring(1));

        const shouldUseUbuntu = name
          .split('')
          .every((_, i) => ubuntuTTF.hasGlyphForCodePoint(name.codePointAt(i)));

        template.print(
          shouldUseUbuntu ? ubuntuFNT : arialFNT,
          30,
          Y,
          {
            text: name.substring(0, 12),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          120,
          MAX_HEIGHT
        );

        template.print(
          ubuntuFNT,
          150,
          Y,
          {
            text: totalPugs.toString(),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );

        template.print(
          ubuntuFNT,
          200,
          Y,
          {
            text: totalRating.toFixed(2),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );
        template.print(
          ubuntuFNT,
          250,
          Y,
          {
            text: won.toString(),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );
        template.print(
          ubuntuFNT,
          300,
          Y,
          {
            text: lost.toString(),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );
        template.print(
          ubuntuFNT,
          350,
          Y,
          {
            text: winP,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );
        Y += 25;
      });

      const imageName = Date.now();
      template.write(`generated/${imageName}.png`);

      await channel.send('', {
        files: [`generated/${imageName}.png`],
      });

      try {
        fs.unlinkSync(`generated/${imageName}.png`);
      } catch (error) {
        console.log('unlink error: ', error);
      }
    });
  } catch (error) {
    console.log(error);
    channel.send('Something went wrong');
  }
};

export const getBottom10 = async ({ channel }, [gameTypeArg], serverId, _) => {
  try {
    const state = store.getState();
    const { pugChannel, gameTypes } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        } <#${pugChannel}>`
      );

    if (!gameTypeArg)
      return channel.send('Invalid! specify the gametype aswell');

    const gameType = gameTypes.find(g => g.name === gameTypeArg.toLowerCase());
    if (!gameType)
      return channel.send(
        `**${gameTypeArg.toUpperCase()}** is not a registered gametype`
      );

    const allPlayers = await Users.find(
      { server_id: serverId },
      { username: 1, stats: 1 }
    );

    const gameTypeName = gameTypeArg.toLowerCase();
    const sortedPlayers = allPlayers
      .map(({ username, stats }) => {
        if (!stats || !stats[gameTypeName]) return undefined;

        const { won, lost, totalRating } = stats[gameTypeName];
        if (won + lost < 3) return undefined; // must have atleast 3 games to be considered

        const winP = won / (won + lost);
        const points = (1 + 0.015 * winP * 100) * (1 + 1.5 / totalRating);

        if (isNaN(points)) return undefined;

        return {
          username,
          points,
          stats: stats[gameTypeName],
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.points - a.points);

    const startPoint = sortedPlayers.length - 10;
    const bottom10 = sortedPlayers.slice(startPoint);

    Jimp.read('assets/bottom10_template.png').then(async template => {
      const { arialFNT, obelixFNT, ubuntuFNT, ubuntuTTF } = await FONTS;
      let Y = 50;
      const MAX_HEIGHT = 25;

      bottom10.forEach((player, i) => {
        const {
          username,
          stats: { totalPugs, totalRating, won, lost },
        } = player;
        const winP = `${((won / (won + lost)) * 100).toFixed(0)}%`;
        const name = username.replace(/\\[^\\]/g, c => c.substring(1));

        const shouldUseUbuntu = name
          .split('')
          .every((_, i) => ubuntuTTF.hasGlyphForCodePoint(name.codePointAt(i)));

        if (startPoint + 1 + i < sortedPlayers.length - 2) {
          template.print(
            obelixFNT,
            0,
            Y,
            {
              text: (startPoint + 1 + i).toString(),
              alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
              alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
            },
            30,
            MAX_HEIGHT
          );
        }

        template.print(
          shouldUseUbuntu ? ubuntuFNT : arialFNT,
          30,
          Y,
          {
            text: name.substring(0, 12),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          120,
          MAX_HEIGHT
        );

        template.print(
          ubuntuFNT,
          150,
          Y,
          {
            text: totalPugs.toString(),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );

        template.print(
          ubuntuFNT,
          200,
          Y,
          {
            text: totalRating.toFixed(2),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );
        template.print(
          ubuntuFNT,
          250,
          Y,
          {
            text: won.toString(),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );
        template.print(
          ubuntuFNT,
          300,
          Y,
          {
            text: lost.toString(),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );
        template.print(
          ubuntuFNT,
          350,
          Y,
          {
            text: winP,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );
        Y += 25;
      });

      const imageName = Date.now();
      template.write(`generated/${imageName}.png`);

      await channel.send('', {
        files: [`generated/${imageName}.png`],
      });

      try {
        fs.unlinkSync(`generated/${imageName}.png`);
      } catch (error) {
        console.log('unlink error: ', error);
      }
    });
  } catch (error) {
    console.log(error);
    channel.send('Something went wrong');
  }
};

export const getTopXY = async (
  { channel },
  [gameTypeArg],
  serverId,
  { action }
) => {
  try {
    const state = store.getState();
    const { pugChannel, gameTypes } = state.pugs[serverId];

    if (pugChannel !== channel.id)
      return channel.send(
        `Active channel for pugs is ${
          pugChannel ? `<#${pugChannel}>` : `not present`
        }`
      );

    if (!gameTypeArg)
      return channel.send('Invalid! specify the gametype aswell');

    const gameType = gameTypes.find(g => g.name === gameTypeArg.toLowerCase());
    if (!gameType)
      return channel.send(
        `**${gameTypeArg.toUpperCase()}** is not a registered gametype`
      );

    const [start, end] = action
      .replace('top', '')
      .split('-')
      .map(Number);

    if (end - start !== 10)
      return channel.send(
        'Difference between **start** & **end** should be 10!'
      );

    const allPlayers = await Users.find(
      { server_id: serverId },
      { username: 1, stats: 1 }
    );

    const gameTypeName = gameTypeArg.toLowerCase();
    const topXYPlayers = allPlayers
      .map(({ username, stats }) => {
        if (!stats || !stats[gameTypeName]) return undefined;

        const { won, lost, totalRating } = stats[gameTypeName];
        if (won + lost < 3) return undefined; // must have atleast 3 games to be considered

        const winP = won / (won + lost);
        const points = (1 + 0.015 * winP * 100) * (1 + 1.5 / totalRating);

        if (isNaN(points)) return undefined;

        return {
          username,
          points,
          stats: stats[gameTypeName],
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.points - a.points)
      .slice(start, end);

    if (topXYPlayers.length === 0) return channel.send(`There aren't any`);

    Jimp.read('assets/top_template.png').then(async template => {
      const { arialFNT, obelixFNT, ubuntuFNT, ubuntuTTF } = await FONTS;
      let Y = 50;
      const MAX_HEIGHT = 25;

      template.print(
        obelixFNT,
        0,
        0,
        {
          text: `TOP ${start}-${end}`,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        },
        400,
        MAX_HEIGHT
      );

      topXYPlayers.forEach((player, i) => {
        const {
          username,
          stats: { totalPugs, totalRating, won, lost },
        } = player;
        const winP = `${((won / (won + lost)) * 100).toFixed(0)}%`;
        const name = username.replace(/\\[^\\]/g, c => c.substring(1));

        const shouldUseUbuntu = name
          .split('')
          .every((_, i) => ubuntuTTF.hasGlyphForCodePoint(name.codePointAt(i)));

        template.print(
          obelixFNT,
          0,
          Y,
          {
            text: (start + 1 + i).toString(),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          30,
          MAX_HEIGHT
        );

        template.print(
          shouldUseUbuntu ? ubuntuFNT : arialFNT,
          30,
          Y,
          {
            text: name.substring(0, 12),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          120,
          MAX_HEIGHT
        );

        template.print(
          ubuntuFNT,
          150,
          Y,
          {
            text: totalPugs.toString(),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );

        template.print(
          ubuntuFNT,
          200,
          Y,
          {
            text: totalRating.toFixed(2),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );
        template.print(
          ubuntuFNT,
          250,
          Y,
          {
            text: won.toString(),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );
        template.print(
          ubuntuFNT,
          300,
          Y,
          {
            text: lost.toString(),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );
        template.print(
          ubuntuFNT,
          350,
          Y,
          {
            text: winP,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          50,
          MAX_HEIGHT
        );
        Y += 25;
      });

      const imageName = Date.now();
      template.write(`generated/${imageName}.png`);

      await channel.send('', {
        files: [`generated/${imageName}.png`],
      });

      try {
        fs.unlinkSync(`generated/${imageName}.png`);
      } catch (error) {
        console.log('unlink error: ', error);
      }
    });
  } catch (error) {
    console.log(error);
    channel.send('Something went wrong');
  }
};
