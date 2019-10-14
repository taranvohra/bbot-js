import { DiscordServers, UT99QueryServers, Blocks, GameTypes } from '../models';
import store from '../store';
import { INIT, setQueryChannel, setPugChannel, setPrefix as setPrefixAction } from '../store/actions';
import { privilegedRoles, defaultPrefix } from '../constants';
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

    await Promise.all([
      new DiscordServers({ server_id: serverId }).save(),
      new UT99QueryServers({ server_id: serverId }).save(),
      new Blocks({ server_id: serverId }).save(),
      new GameTypes({ server_id: serverId }).save(),
    ]);
    store.dispatch(INIT({ serverId }));
    message.channel.send('Server registered with bBot!');
  } catch (err) {
    message.channel.send('Something went wrong');
    console.log(err);
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
        `Please register the server with the bot! Type: ${defaultPrefix}register`
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
    message.channel.send('Something went wrong');
    console.log(err);
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
        `Please register the server with the bot! Type: ${defaultPrefix}register`
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
    message.channel.send('Something went wrong');
    console.log(err);
  }
};

export const setPrefix = async (message, [proposedPrefix], serverId, { roles }) => {
  try {
    if (!hasPrivilegedRole(privilegedRoles, roles)) return;
    const res = await DiscordServers.findOne({
      server_id: serverId,
    }).exec();

    if (!res)
      return message.channel.send(
        `Please register the server with the bot! Type ${defaultPrefix}register`
      );

    if (proposedPrefix && proposedPrefix.length <= 3) {
      const updatedEntity = await DiscordServers.findOneAndUpdate(
        { server_id: serverId },
        { prefix: proposedPrefix }
      ).exec();

      store.dispatch(setPrefixAction({ serverId, prefix: proposedPrefix }));

      message.channel.send(
        `**${proposedPrefix}** has been set as prefix.`
      );
    }
    else {
      message.channel.send('error: prefix length must be 1-3 long.');
    }
  } catch (err) {
    message.channel.send('Something went wrong');
    console.log(err);
  }
};
