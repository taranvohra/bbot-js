import store from '../store';
import { GameTypes } from '../models';
import { computePickingOrder, hasPrivilegedRole, shuffle } from '../utils';
import { privilegedRoles, captainTimeout } from '../constants';
import { formatListGameTypes } from '../formats';
import { assignGameTypes } from '../store/actions';

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

  removePlayer(user) {}

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

  findPlayer(user) {
    return this.players.find(u => u.id === user.id);
  }

  stopPug() {
    this.cleanup();
  }

  cleanup() {
    //  TODO
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
    }, []);

    channel.send(formatListGameTypes(channel.guild.name, gamesList));
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

  const user = { id, username, roles };
  const results = args.map(a => {
    const game = a.toLowerCase();
    const gameType = gameTypes.some(g => g.name === game);

    if (!gameType) return { user, name: game, joined: -1 }; // -1 is for NOT FOUND

    const pug = list.find(p => p.name === game) || new Pug(gameType);
    const joined = pug.addPlayer(user);
    return {
      user,
      joined,
      name: game,
      activeCount: pug.players.length,
      maxPlayers: pug.noOfPlayers,
    };
  });
};
