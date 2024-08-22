module.exports = {
  data: {
    name: 'say',
    description: 'Repeat a message',
  },
  async execute(message, args) {
    const content = args.join(' ');

    if (content.length > 2000) {
      const excessCharacters = content.length - 2000;
      const warningMessage = await message.reply(
        `The message is too long by ${excessCharacters} characters. Please try a shorter message.`
      );

      setTimeout(() => {
        warningMessage.delete().catch(console.error);
      }, 5000);

      message.delete().catch(console.error);
      return;
    }

    message.channel.send(content);
    message.delete().catch(console.error);
  },
};
