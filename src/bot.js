import { Client } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

/*
 * BOT
 *  INITIALIZATION
 */
const bBot = new Client({
  disabledEvents: ['TYPING_START', 'CHANNEL_UPDATE', 'USER_UPDATE'],
});

(() => {
  bBot.login(process.env.DISCORD_BOT_TOKEN);
})();
