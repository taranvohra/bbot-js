import '@babel/polyfill';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Client, User, Message } from 'discord.js';
import store from './store';
import {
  INIT,
  setQueryChannel,
  setPugChannel,
  assignQueryServers,
  assignGameTypes,
} from './store/actions';
import { DiscordServers, UT99QueryServers, GameTypes } from './models';
import { handlers, commands, emitters } from './commands';
import { sanitizeName } from './utils';
import { prefix, offline, pugEvents } from './constants';
import { formatBroadcastCaptainsReady } from './formats';

dotenv.config();

const bBot = new Client({
  disabledEvents: ['TYPING_START', 'CHANNEL_UPDATE', 'USER_UPDATE'],
});

async function onMessage(message) {
  if (message.author.equals(bBot.user)) return;
  if (!message.content.startsWith(prefix)) return;

  const { id, username } = message.author;
  const roles = message.member ? message.member.roles : null;
  const isInvisible = message.author.presence.status === 'offline';

  const {
    guild: { id: serverId },
  } = message;

  if (!serverId) return;

  const hasUserMention = message.mentions.users.first();
  const mentionedUser = hasUserMention
    ? { id: hasUserMention.id, username: sanitizeName(hasUserMention.username) }
    : null;

  const [first, ...args] = message.content
    .substring(prefix.length)
    .split(' ')
    .filter(Boolean);
  const action = first && first.toLowerCase();
  const soloType = args[0] === offline || args.length === 0 ? 1 : 0;

  const foundCommand = commands.find(
    cmd =>
      cmd.aliases.includes(action) && (cmd.solo === soloType || cmd.solo === 2)
  );

  if (foundCommand) {
    return handlers[foundCommand.key](message, args, serverId, {
      id,
      roles,
      username: sanitizeName(username),
      mentionedUser,
      isInvisible,
      action,
    });
  }
  // message.channel.send(`Command not found`);
}

/*
 * BOT
 *  EVENTS
 */

bBot.on('ready', () => {
  console.log(`Bot started running at ${new Date().toUTCString()}`);
});

bBot.on('message', onMessage);

bBot.on('presenceUpdate', (_, { user, guild, presence: { status } }) => {
  if (status === 'offline') {
    const state = store.getState();
    const { list = [], pugChannel } = state.pugs[guild.id] || {};
    for (let i = 0; i < list.length; i++) {
      const pug = list[i];
      const isInPug = pug.findPlayer(user);

      if (isInPug) {
        const channel = guild.channels.get(pugChannel);
        const message = new Message(
          channel,
          {
            author: new User(bBot, {
              bot: false,
              id: user.id,
              username: user.username,
            }),
            attachments: new Map(),
            embeds: [],
            content: 'lva',
          },
          bBot
        );
        handlers['leaveAllGameTypes'](message, [offline], guild.id, {
          id: user.id,
          username: sanitizeName(user.username),
        });
        break;
      }
    }
  }
});

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/bBot', {
      useNewUrlParser: true,
      poolSize: 5,
      useFindAndModify: false,
    });
    await hydrateStore();
    bBot.login(process.env.DISCORD_BOT_TOKEN);
  } catch (error) {
    console.log('error', error);
  }
})();

const hydrateStore = async () => {
  const [dServers, qServers, gameTypes] = await Promise.all([
    DiscordServers.find({}).exec(),
    UT99QueryServers.find({}).exec(),
    GameTypes.find({}).exec(),
  ]);

  dServers.forEach(({ server_id, pug_channel, query_channel }) => {
    store.dispatch(INIT({ serverId: server_id }));
    store.dispatch(
      setPugChannel({
        serverId: server_id,
        pugChannel: pug_channel,
      })
    );
    store.dispatch(
      setQueryChannel({ serverId: server_id, queryChannel: query_channel })
    );
  });

  qServers.forEach(({ server_id, query_servers }) => {
    store.dispatch(
      assignQueryServers({
        serverId: server_id,
        list: Array.from(query_servers),
      })
    );
  });

  gameTypes.forEach(({ server_id, game_types }) => {
    store.dispatch(
      assignGameTypes({
        serverId: server_id,
        gameTypes: Array.from(game_types),
      })
    );
  });
};

/**
 * P U G
 * E V E N T S
 */
emitters.pugEventEmitter.on(pugEvents.captainsReady, (serverId, name) => {
  const state = store.getState();
  const { pugChannel, list } = state.pugs[serverId];
  const pug = list.find(p => p.name === name);

  bBot.channels.get(pugChannel).send(formatBroadcastCaptainsReady(pug));
});
