import { Client } from 'discord.js';
import dotenv from 'dotenv';
import { prefix, commands } from './contants';
dotenv.config();

const bBot = new Client({
  disabledEvents: ['TYPING_START', 'CHANNEL_UPDATE', 'USER_UPDATE'],
});

bBot.on('message', async message => {
  if (message.author.equals(bot.user)) return;
  if (!message.content.startsWith(prefix)) return;

  const { roles } = message.memeber;
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
});

/*
 * BOT
 *  INITIALIZATION
 */
(() => {
  bBot.login(process.env.DISCORD_BOT_TOKEN);
})();
