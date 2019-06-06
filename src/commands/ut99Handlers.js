import store from '../store';
import crypto from 'crypto';
import { UT99QueryServers } from '../models';

export const servers = async ({ channel }, _, serverId, __) => {
  try {
    const state = store.getState();
    const { queryChannel, ...queryServers } = state.queryServers[serverId];

    if (queryChannel !== channel.id)
      return channel.send(`Active channel for querying is <#${queryChannel}>`);
  } catch (error) {}
};

export const addQueryServer = async (
  { channel },
  [hp, ...rest],
  serverId,
  __
) => {
  try {
    const state = store.getState();
    const { queryChannel, ...queryServers } = state.queryServers[serverId];
    const [host, port] = hp.split(':');
    const name = rest.reduce((acc, curr) => (acc += curr + ' '), '');

    if (!host || !port || !name) return channel.send('Invalid command');

    const key = crypto
      .createHash('sha256')
      .update(hp)
      .digest('hex');

    if (queryServers.some(s => s.key === key))
      return channel.send('Query Server already exists!');

    const newServer = {
      server_id: serverId,
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

    channel.send('Query Server added');
  } catch (error) {
    console.log(error);
  }
};
