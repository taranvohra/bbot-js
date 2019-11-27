import store from '../store';
import crypto from 'crypto';
import { UT99QueryServers } from '../models';
import {
  pushQueryServer,
  removeQueryServer,
  initCmdCooldown,
} from '../store/actions';
import { privilegedRoles, coolDownRoles, coolDownSeconds } from '../constants';
import {
  hasPrivilegedRole,
  createAlternatingObject,
  hasCoolDownRole,
} from '../utils';
import { formatQueryServers, formatQueryServerStatus } from '../formats';
import API from '../services/API';

export const servers = async ({ channel }, _, serverId, __) => {
  try {
    const state = store.getState();
    const { queryChannel, list } = state.queryServers[serverId];

    if (queryChannel !== channel.id)
      return channel.send(
        `Active channel for querying is ${
          queryChannel ? `<#${queryChannel}>` : `is not present`
        }`
      );

    const sortedList = list.sort((a, b) => a.timestamp - b.timestamp);
    channel.send(formatQueryServers(sortedList));
  } catch (error) {
    console.log(error);
  }
};

export const addQueryServer = async (
  { channel },
  [hp, ...rest],
  serverId,
  { roles }
) => {
  try {
    if (!hasPrivilegedRole(privilegedRoles, roles)) return;
    const state = store.getState();
    const { list = [] } = state.queryServers[serverId];

    const [host, port] = hp.split(':');
    const name = rest.reduce((acc, curr) => (acc += curr + ' '), '');

    if (!host || !port || !name) return channel.send('Invalid command');

    const key = crypto
      .createHash('sha256')
      .update(hp)
      .digest('hex');

    if (list.some(s => s.key === key))
      return channel.send('Query Server already exists!');

    const newServer = {
      key,
      name,
      host,
      port,
      timestamp: Date.now(),
    };

    await UT99QueryServers.findOneAndUpdate(
      { server_id: serverId },
      { $push: { query_servers: newServer } }
    ).exec();

    store.dispatch(pushQueryServer({ serverId, queryServer: newServer }));
    channel.send('Query Server added');
  } catch (error) {
    console.log(error);
  }
};

export const delQueryServer = async (
  { channel },
  [which, ...rest],
  serverId,
  { roles }
) => {
  try {
    if (!hasPrivilegedRole(privilegedRoles, roles)) return;
    const state = store.getState();
    const { list = [] } = state.queryServers[serverId];

    const index = parseInt(which) - 1;
    const sortedList = list.sort((a, b) => a.timestamp - b.timestamp);

    if (!sortedList[index]) return channel.send('Query Server not found!');

    const updatedList = sortedList.filter((_, i) => i !== index);

    await UT99QueryServers.findOneAndUpdate(
      { server_id: serverId },
      { query_servers: updatedList }
    ).exec();

    store.dispatch(removeQueryServer({ serverId, index: index }));
    channel.send('Query Server removed');
  } catch (error) {
    console.log(error);
  }
};

export const queryUT99Server = async (
  { channel },
  [arg, ...rest],
  serverId,
  { roles }
) => {
  try {
    const state = store.getState();
    const { queryChannel, list = [] } = state.queryServers[serverId];
    if (queryChannel !== channel.id)
      return channel.send(
        `Active channel for querying is ${
          queryChannel ? `<#${queryChannel}>` : `is not present`
        }`
      );

    // Check if command is in cooldown mode for that role
    if (hasCoolDownRole(coolDownRoles, roles)) {
      const { cooldown } = state.globals[serverId];
      const timeDiff = cooldown.query - Date.now();
      if (cooldown.query !== undefined && timeDiff > 0) {
        return channel.send(
          `COOLDOWN! You will be able to use this command after ${(
            timeDiff / 1000
          ).toFixed(0)} second${timeDiff / 1000 > 1 ? `s` : ``}`
        );
      }
    }

    const sortedList = list.sort((a, b) => a.timestamp - b.timestamp);
    const { host, port = 7777 } =
      sortedList[parseInt(arg) - 1] ||
      arg.split(':').reduce((acc, curr, i) => {
        i === 0 ? (acc['host'] = curr) : (acc['port'] = curr);
        return acc;
      }, {});

    if (!host) return channel.send('Invalid query');

    const response = await API.queryUT99Server(host, parseInt(port) + 1); // UDP port is +1
    const splitted = response.split('\\');
    const final = [...splitted];
    final.shift();
    final.unshift();

    const { info, players } = final.reduce(
      (acc, curr) => {
        if (curr === 'player_0' || curr === 'Player_0')
          acc.hasPlayersNow = true;

        acc.hasPlayersNow ? acc.players.push(curr) : acc.info.push(curr);
        return acc;
      },
      {
        info: [],
        players: [],
        hasPlayersNow: false,
      }
    );

    const formattedResponse = formatQueryServerStatus(
      { ...createAlternatingObject(info), host, port },
      createAlternatingObject(players)
    );

    // Save cooldown expiry timestamp in redux store
    if (hasCoolDownRole(coolDownRoles, roles)) {
      store.dispatch(
        initCmdCooldown({
          serverId,
          command: 'query',
          timestamp: Date.now() + coolDownSeconds * 1000,
        })
      );
    }

    channel.send(formattedResponse);
  } catch (error) {
    console.log(error);
  }
};
