const { EmbedBuilder } = require("discord.js");
const dataHandler = require("../modules/dataHandler.js");

module.exports = {
	name: "guildMemberAdd",
	async execute(member) {
		global.log.debug(`guildMemberAdd event received for user: ${member.user.username} (${member.user.id})`);

		if (member.user.bot) {
			global.log.debug(`Ignoring guildMemberAdd event for bot: ${member.user.username} (${member.user.id})`);
			return;
		}

		try {
			const welcomeEmbed = new EmbedBuilder()
				.setTitle(`Hello, ${member.user.username}!`)
				.setDescription(
					`Welcome to the server! 🎉\n\nWe're excited to have you here. Make sure to check out the rules and introduce yourself in the appropriate channel!\n\nIf you have any questions, feel free to reach out to the staff or any of the members. Enjoy your stay!`
				)
				.setColor(global.config.embeds.colors.default)
				.setThumbnail(member.user.displayAvatarURL())
				.setTimestamp();

			const welcomeChannelId = global.config.joiner.channel; 
			const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

			if (welcomeChannel) {
				const welcomeMessage = await welcomeChannel.send({
					content: `<@${member.user.id}>`,
					embeds: [welcomeEmbed],
				});
				global.log.debug(`Sent welcome message to ${welcomeChannel.name}`);

				const welcomeEmoji = global.config.emotes.welcome;
				await welcomeMessage.react(welcomeEmoji);
			} else {
				global.log.warn(`Welcome channel not found for user: ${member.user.username} (${member.user.id})`);
			}

			const joinRoles = global.config.joiner.joinroles || [];
			const accountCreationTimestamp = Math.floor(member.user.createdAt.getTime() / 1000);
			const nonBotMembers = member.guild.members.cache.filter((m) => !m.user.bot);
			const joinPosition = nonBotMembers.size;

			if (joinRoles.length > 0) {
				global.log.debug(`Assigning join roles to new member: ${member.user.username} (${member.user.id})`);
				for (const roleId of joinRoles) {
					const role = member.guild.roles.cache.get(roleId);
					if (role) {
						await member.roles.add(role);
						global.log.debug(`Role ${role.name} assigned to user: ${member.user.username} (${member.user.id})`);
					} else {
						global.log.warn(`Role with ID ${roleId} not found for user: ${member.user.username} (${member.user.id})`);
					}
				}
			}

			const logEmbed = new EmbedBuilder()
				.setTitle("User Joined")
				.setDescription(`**Created**: <t:${accountCreationTimestamp}:R>\n**Join Position**: ${joinPosition}th`)
				.setColor(global.config.embeds.colors.default)
				.setThumbnail(member.user.displayAvatarURL())
				.setTimestamp()
				.setAuthor({
					name: member.user.username,
					iconURL: member.user.displayAvatarURL(),
				})
				.setFooter({
					text: `User ID: ${member.user.id}`,
				});

			const channelId = global.config.guild.channels.logs.joins;
			const channel = member.guild.channels.cache.get(channelId);

			if (channel) {
				global.log.debug(`Sending join log for user: ${member.user.username} (${member.user.id}) to log channel.`);
				await channel.send({ embeds: [logEmbed] });
			} else {
				global.log.warn(`Log channel not found for user: ${member.user.username} (${member.user.id})`);
			}
		} catch (error) {
			global.log.error(`Error handling guildMemberAdd event for user: ${member.user.username} (${member.user.id}): ${error.message}`);
		}
	},
};
