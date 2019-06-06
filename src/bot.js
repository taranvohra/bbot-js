import '@babel/polyfill';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Client } from 'discord.js';
import store from './store';
import { initStore } from './store/actions';
import { prefix } from './constants';
import { handlers, commands } from './commands';
import DiscordServers from './models/discordServers';

dotenv.config();

const bBot = new Client({
  disabledEvents: ['TYPING_START', 'CHANNEL_UPDATE', 'USER_UPDATE'],
});

bBot.on('message', async message => {
  if (message.author.equals(bBot.user)) return;
  if (!message.content.startsWith(prefix)) return;

  const { id, username } = message.author;
  const { roles } = message.member;
  const {
    channel: {
      guild: { id: serverId },
    },
  } = message;

  if (!serverId) return;

  const [first, ...args] = message.content
    .substring(prefix.length)
    .split(' ')
    .filter(Boolean);
  const action = first && first.toLowerCase();

  const foundCommand = commands.find(cmd => cmd.aliases.includes(action));

  if (foundCommand) {
    return handlers[foundCommand.key](message, args, serverId, {
      id,
      username,
      roles,
    });
  }
  message.channel.send(`Command not found`);
});

/*
 * BOT
 *  INITIALIZATION
 */
bBot.on('ready', () => {
  console.log(`Bot started running at ${new Date().toUTCString()}`);
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
  const servers = await DiscordServers.find({}).exec();
  servers.forEach(({ server_id, pug_channel, query_channel }) => {
    store.dispatch(
      initStore({
        serverId: server_id,
        pugChannel: pug_channel,
        queryChannel: query_channel,
      })
    );
  });
};
