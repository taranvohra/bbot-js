import DiscordServers from '../models/discordServers';
import store from '../store';

export const registerServer = async (message, _, serverId, __) => {
  try {
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

export const setQueryChannel = async (message, _, serverId, __) => {
  try {
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

    store.dispatch({
      type: 'INIT',
      payload: { serverId, queryChannel: message.channel.id },
    });

    console.log(store.getState());
    message.channel.send(
      `<#${message.channel.id}> has been set as the query channel`
    );
  } catch (error) {
    console.log(error);
    message.channel.send(
      'Something went wrong. The developer of this bot has been notified '
    );
  }
};

export const setPugChannel = async (message, _, serverId, __) => {
  try {
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

    store.dispatch({
      type: 'INIT',
      payload: { serverId, pugChannel: message.channel.id },
    });

    console.log(store.getState());
    message.channel.send(
      `<#${message.channel.id}> has been set as the pug channel`
    );
  } catch (error) {
    console.log(error);
    message.channel.send(
      'Something went wrong. The developer of this bot has been notified '
    );
  }
};
