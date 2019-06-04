export const registerServer = (message, args, { id, username, roles }) => {
  message.channel.send(`Command found. ${id} ${username}`);
};
