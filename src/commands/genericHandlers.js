import { DiscordServers } from '../models';
import store from '../store';
import { setQueryChannel, setPugChannel } from '../store/actions';
import { privilegedRoles } from '../constants';
import { hasPrivilegedRole } from '../utils';

export const registerServer = async (message, _, serverId, { roles }) => {
  try {
    if (!hasPrivilegedRole(privilegedRoles, roles)) return;
    const res = await DiscordServers.findOne({
      server_id: serverId,
    }).exec();

    if (res)
      return message.channel.send(
        'Server is already registered with bBot :wink:'
      );

    await new DiscordServers({ server_id: serverId }).save();
    message.channel.send('Server registered with bBot!');
  } catch (err) {
    message.channel.send(
      'Something went wrong. The developer of this bot has been notified '
    );
  }
};

export const registerQueryChannel = async (message, _, serverId, { roles }) => {
  try {
    if (!hasPrivilegedRole(privilegedRoles, roles)) return;
    const res = await DiscordServers.findOne({
      server_id: serverId,
    }).exec();

    if (!res)
      return message.channel.send(
        'Please register the server with the bot! Type .register'
      );

    await DiscordServers.findOneAndUpdate(
      { server_id: serverId },
      { query_channel: message.channel.id }
    ).exec();

    store.dispatch(
      setQueryChannel({ serverId, queryChannel: message.channel.id })
    );

    message.channel.send(
      `<#${message.channel.id}> has been set as the query channel`
    );
  } catch (err) {
    message.channel.send(
      'Something went wrong. The developer of this bot has been notified '
    );
  }
};

export const registerPugChannel = async (message, _, serverId, { roles }) => {
  try {
    if (!hasPrivilegedRole(privilegedRoles, roles)) return;
    const res = await DiscordServers.findOne({
      server_id: serverId,
    }).exec();

    if (!res)
      return message.channel.send(
        'Please register the server with the bot! Type .register'
      );

    await DiscordServers.findOneAndUpdate(
      { server_id: serverId },
      { pug_channel: message.channel.id }
    ).exec();

    store.dispatch(setPugChannel({ serverId, pugChannel: message.channel.id }));

    message.channel.send(
      `<#${message.channel.id}> has been set as the pug channel`
    );
  } catch (err) {
    message.channel.send(
      'Something went wrong. The developer of this bot has been notified '
    );
  }
};
