import '@babel/polyfill';
import { Client } from 'discord.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import store from './store';
import { prefix, commands } from './contants';
import handlers from './commands';

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
  const [first, ...args] = message.content
    .substring(prefix.length)
    .split(' ')
    .filter(Boolean);
  const action = first && first.toLowerCase();

  const foundCommand = commands.find(cmd => cmd.aliases.includes(action));

  if (foundCommand) {
    console.log(handlers);
    console.log(foundCommand.key);
    handlers[foundCommand.key](message, args, { id, username, roles });
  } else {
    message.channel.send(`Command not found`);
  }
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
    });
    bBot.login(process.env.DISCORD_BOT_TOKEN);
  } catch (error) {
    console.log('error', error);
  }
})();
