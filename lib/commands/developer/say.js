const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    permissions: [`Developer`],
	data: new SlashCommandBuilder()
		.setName("say")
		.setDescription("Repeat a message in a specified channel")
		.addStringOption((option) => option.setName("message").setDescription("The message to send").setRequired(true))
		.addChannelOption((option) => option.setName("channel").setDescription("The channel to send the message to").setRequired(false)),
    permissions: [ `Developer` ], 
	async execute(interaction) {
		const channel = interaction.options.getChannel("channel") || interaction.channel;
		const content = interaction.options.getString("message");

		if (content.length > 2000) {
			const excessCharacters = content.length - 2000;
			const warningMessage = await interaction.reply({
				content: `The message is too long by ${excessCharacters} characters. Please try a shorter message.`,
				ephemeral: true,
			});

			setTimeout(() => {
				warningMessage.delete().catch(log.error(error,  false));
			}, 5000);

			return;
		}

		await interaction.deferReply({ ephemeral: true });

		try {
			await channel.send(content);
			await interaction.editReply({ content: `Message sent to ${channel}`, ephemeral: true });
		} catch (error) {
			log.error(error,  false);
			await interaction.editReply({ content: "There was an error sending the message.", ephemeral: true });
		}
	},
};
