import Discord from 'discord.js';

const embedColor = '#11806A';

export const formatQueryServers = list => {
  const richEmbed = new Discord.RichEmbed();

  const description = list.reduce((acc, curr, index) => {
    acc += `\`${index + 1}\`\u00A0\u00A0\u00A0${curr.name}\n`;
    return acc;
  }, '');

  richEmbed.setTitle(`IP\u00A0\u00A0\u00A0Name`);
  richEmbed.setColor(embedColor);
  richEmbed.setDescription(description || 'No game servers added yet');
  richEmbed.setFooter('To query, type .q ip');
  return richEmbed;
};
