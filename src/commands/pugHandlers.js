import store from '../store';
import { GameTypes } from '../models';
import { computePickingOrder, hasPrivilegedRole } from '../utils';
import { privilegedRoles } from '../constants';

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

    const { game_types: list } = await GameTypes.findOne({
      server_id: serverId,
    }).exec();

    if (list.some(g => g.name === gameName.toLowerCase()))
      return channel.send('Gametype already exists');

    const pickingOrder = computePickingOrder(
      parseInt(noOfPlayers),
      parseInt(noOfTeams)
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

    const { game_types: list = [] } = await GameTypes.findOne({
      server_id: serverId,
    }).exec();

    if (!list.some(g => g.name === gameName.toLowerCase()))
      return channel.send("Gametype doesn't exist");

    const updatedGameTypes = list.filter(
      g => g.name !== gameName.toLowerCase()
    );

    await GameTypes.findOneAndUpdate(
      { server_id: serverId },
      { game_types: updatedGameTypes }
    ).exec();

    channel.send(`**${gameName}** has been removed`);
  } catch (error) {
    channel.send('Something went wrong');
    console.log(error);
  }
};
