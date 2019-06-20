import store from '../store';
import crypto from 'crypto';
import { UT99QueryServers } from '../models';
import { pushQueryServer, removeQueryServer } from '../store/actions';
import { privilegedRoles } from '../constants';
import { hasPrivilegedRole } from '../utils';
import { formatQueryServers } from '../formats';

export const servers = async ({ channel }, _, serverId, __) => {
  try {
    const state = store.getState();
    const { queryChannel, list } = state.queryServers[serverId];

    if (queryChannel !== channel.id)
      return channel.send(`Active channel for querying is <#${queryChannel}>`);

    const sortedList = list.sort((a, b) => a.timestamp - b.timestamp);
    channel.send(formatQueryServers(sortedList));
  } catch (error) {
    console.log(error);
    channel.send(`Something went wrong!`);
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

    const index = parseInt(which);
    const sortedList = list.sort((a, b) => a.timestamp - b.timestamp);
    console.log(sortedList);

    if (!sortedList[index]) return channel.send('Query Server not found!');

    const updatedList = sortedList.filter((_, i) => i !== parseInt(index));

    await UT99QueryServers.findOneAndUpdate(
      { server_id: serverId },
      { query_servers: updatedList }
    ).exec();

    store.dispatch(removeQueryServer({ serverId, index: parseInt(index) }));
    channel.send('Query Server removed');
  } catch (error) {
    console.log(error);
  }
};
