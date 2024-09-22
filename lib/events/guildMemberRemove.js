const { EmbedBuilder } = require("discord.js");
const dataHandler = require("../modules/dataHandler.js");

module.exports = {
	name: "guildMemberRemove",
	async execute(member) {
		global.log.debug(`guildMemberRemove event received for user: ${member.user.username} (${member.user.id})`);

		if (member.user.bot) {
			global.log.debug(`Ignoring guildMemberRemove event for bot: ${member.user.username} (${member.user.id})`);
			return;
		}

        const accountCreationTimestamp = Math.floor(member.user.createdAt.getTime() / 1000);

		try {
			const everyoneRoleId = member.guild.id; 
			const roles = member.roles.cache
				.filter(role => role.id !== everyoneRoleId)
				.map(role => role.name)
				.join(", ") || "None";

			const logEmbed = new EmbedBuilder()
				.setTitle("User Left")
				.setDescription(`**Created**: <t:${accountCreationTimestamp}:R>\n**User ID**: ${member.user.id}\n**Roles**: ${roles}`)
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
				global.log.debug(`Sending leave log for user: ${member.user.username} (${member.user.id}) to log channel.`);
				await channel.send({ embeds: [logEmbed] });
			} else {
				global.log.warn(`Log channel not found for user: ${member.user.username} (${member.user.id})`);
			}
		} catch (error) {
			global.log.error(`Error handling guildMemberRemove event for user: ${member.user.username} (${member.user.id}): ${error.message}`);
		}
	},
};
