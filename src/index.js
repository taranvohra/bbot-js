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
  assignBlocks,
  setPrefix,
} from './store/actions';
import { DiscordServers, UT99QueryServers, GameTypes, Blocks } from './models';
import { handlers, commands, emitters } from './commands';
import { sanitizeName } from './utils';
import {
  defaultPrefix,
  offline,
  pugEvents,
  privilegedRoles,
  emojis,
  coolDownRoles,
  coolDownSeconds,
} from './constants';
import { formatBroadcastCaptainsReady } from './formats';
import { compareAsc } from 'date-fns';

dotenv.config();

const bBot = new Client({
  disabledEvents: ['TYPING_START', 'CHANNEL_UPDATE', 'USER_UPDATE'],
});

async function onMessage(message) {
  if (message.author.equals(bBot.user)) return;

  const state = store.getState();
  const channelPrefix = state.globals[message.guild.id].prefix || defaultPrefix;
  if (!message.content.startsWith(channelPrefix)) return;

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
    .substring(channelPrefix.length)
    .split(' ')
    .filter(Boolean);
  const action = first && first.toLowerCase();
  const soloType = args[0] === offline || args.length === 0 ? 1 : 0;

  const foundCommand = commands.find(
    cmd =>
      (!cmd.regex
        ? cmd.aliases.includes(action)
        : cmd.aliases.some(a => cmd.regex(a).test(action))) &&
      (cmd.solo === soloType || cmd.solo === 2)
  );

  if (foundCommand) {
    return handlers[foundCommand.key](message, args, serverId, {
      id,
      roles,
      username: sanitizeName(username),
      mentionedUser,
      isInvisible,
      action,
      client: bBot,
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
  checkIfUserNeedsUnblock();
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

bBot.on(
  'guildMemberUpdate',
  ({ roles: oldRoles }, { roles: newRoles, guild, id }) => {
    const state = store.getState();
    const { pugChannel } = state.pugs[guild.id] || {};
    const { queryChannel } = state.queryServers[guild.id] || {};

    // No point in sending cooldown message
    if (!pugChannel && !queryChannel) return;

    const wasPresentBefore = coolDownRoles.some(cr =>
      oldRoles.find(or => or.name === cr)
    );
    const isPresentNow = coolDownRoles.some(cr =>
      newRoles.find(nr => nr.name === cr)
    );

    const channel = guild.channels.get(pugChannel || queryChannel);
    if (!wasPresentBefore && isPresentNow) {
      // Cooldown Role Added
      channel.send(
        `<@${id}>, you have been assigned a \`COOLDOWN\` role. This because the admins/moderators feel you spam certain bot commands alot. The following commands are part of this restriction:-\n
        **1. promoting pugs**
        **2. querying servers**\n\nThis means you & other members part of this restriction will be able to use the aforementioned commands \`once\` every ${coolDownSeconds} seconds.`
      );
    } else if (wasPresentBefore && !isPresentNow) {
      // Cooldown Role Removed
      channel.send(
        `<@${id}>, the \`COOLDOWN\` restriction has been lifted up by the authorities. Ensure it doesn't happen again.`
      );
    }
  }
);

(async () => {
  try {
    await mongoose.connect(process.env.DB_HOST, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    await hydrateStore();
    await bBot.login(process.env.DISCORD_BOT_TOKEN);
    sendRestartMessageToAllGuilds(bBot);
  } catch (error) {
    console.log('error', error);
  }
})();

const hydrateStore = async () => {
  const [dServers, qServers, gameTypes, blocks] = await Promise.all([
    DiscordServers.find({}).exec(),
    UT99QueryServers.find({}).exec(),
    GameTypes.find({}).exec(),
    Blocks.find({}).exec(),
  ]);

  dServers.forEach(({ server_id, pug_channel, query_channel, prefix }) => {
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

    store.dispatch(setPrefix({ serverId: server_id, prefix: prefix }));
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

  blocks.forEach(({ server_id, blocked_users }) => {
    store.dispatch(
      assignBlocks({
        serverId: server_id,
        blockedUsers: Array.from(blocked_users),
      })
    );
  });
};

const sendRestartMessageToAllGuilds = client => {
  const state = store.getState();
  const allGuildIds = [...client.guilds.keys()];

  allGuildIds.forEach(guildId => {
    const { pugChannel, queryChannel } =
      state.pugs[guildId] || state.queryServers[guildId];
    if (pugChannel || queryChannel) {
      const guild = client.guilds.get(guildId);
      const channel = guild.channels.get(pugChannel || queryChannel);
      channel.send(`I just restarted ${emojis.putricc}`);
    }
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

const checkIfUserNeedsUnblock = () => {
  setInterval(() => {
    const state = store.getState();
    Object.entries(state.blocks).forEach(([serverId, { list }]) => {
      if (list.length > 0) {
        const guild = bBot.guilds.get(serverId.toString());
        const { pugChannel } = state.pugs[serverId];
        const channel = guild.channels.get(pugChannel);

        list.forEach(user => {
          const mentionedUser = { id: user.id, username: user.username };
          if (compareAsc(new Date(), user.expires_at) >= 0) {
            handlers['unblockPlayer']({ channel }, null, serverId, {
              mentionedUser,
              isBot: true,
              roles: [],
            });
          }
        });
      }
    });
  }, 60000);
};

// TODO Remove from store if bot gets removed
// TODO Remove from pugs if user is kicked/banned/leaves server
