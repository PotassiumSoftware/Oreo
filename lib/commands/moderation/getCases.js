const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const dataHandler = require("../../modules/dataHandler.js");

module.exports = {
	permissions: [PermissionsBitField.Flags.ManageMessages],
	data: new SlashCommandBuilder()
		.setName("get-cases")
		.setDescription("Get a list of moderation logs for the entire server or a specific user.")
		.addUserOption((option) => option.setName("user").setDescription("The user to filter cases by.").setRequired(false))
		.addBooleanOption((option) => option.setName("ephemeral").setDescription("Whether or not other people can see this embed.").setRequired(false)),

	async execute(interaction) {
		const targetUser = interaction.options.getUser("user");
		const moderationData = dataHandler.getModerationData();

		if (!Array.isArray(moderationData)) {
			await interaction.reply({ content: "No moderation data found.", ephemeral: true });
			return;
		}

		let filteredCases = moderationData;
		if (targetUser) {
			filteredCases = filteredCases.filter((caseObj) => caseObj.affected_user === targetUser.id);
		}

		if (filteredCases.length === 0) {
			await interaction.reply({
				content: targetUser ? `No cases found for ${targetUser.username}.` : "No cases found.",
				ephemeral: true,
			});
			return;
		}

		filteredCases.sort((a, b) => b.case_id - a.case_id);

		const casesPerPage = 5;
		let page = 0;

		const totalPages = Math.ceil(filteredCases.length / casesPerPage);
		const totalLogs = filteredCases.length;

		const createEmbed = (page) => {
			const embed = new EmbedBuilder().setTitle(`Moderation Cases ${targetUser ? `for ${targetUser.username}` : ""}`);

			const casesToDisplay = filteredCases.slice(page * casesPerPage, (page + 1) * casesPerPage);
			casesToDisplay.forEach((caseObj) => {
				const timestamp = Math.floor(caseObj.timestamp / 1000);
				const date = `<t:${timestamp}:F>`;
				const fieldValue = `**Date**: ${date}\n**Type**: ${caseObj.type.toUpperCase()}\n**User**: <@${caseObj.affected_user}>\n**Moderator**: <@${caseObj.moderator_id}>\n**Reason**: ${
					caseObj.reason
				}\n**Moderator Notes**: ${caseObj.moderator_note}`;

				embed.addFields({
					name: `Case ${caseObj.case_id}`,
					value: fieldValue,
					inline: false,
				});
			});

			embed.setFooter({ text: `${totalLogs} Total logs | Page ${page + 1}/${totalPages}` });
			return embed;
		};

		const embed = createEmbed(page);
		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId("prev")
				.setLabel("Previous")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(page === 0),
			new ButtonBuilder()
				.setCustomId("next")
				.setLabel("Next")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(page >= totalPages - 1)
		);

		const ephemeral = interaction.options.getBoolean("ephemeral") ?? true;
		const reply = await interaction.reply({ embeds: [embed], components: [row], ephemeral, fetchReply: true });

		const filter = (buttonInteraction) => buttonInteraction.user.id === interaction.user.id;
		const buttonCollector = reply.createMessageComponentCollector({ filter, time: 600000 });

		buttonCollector.on("collect", async (buttonInteraction) => {
			if (buttonInteraction.customId === "prev" && page > 0) {
				page--;
			} else if (buttonInteraction.customId === "next" && page < totalPages - 1) {
				page++;
			}

			const newEmbed = createEmbed(page);
			const newRow = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId("prev")
					.setLabel("Previous")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(page === 0),
				new ButtonBuilder()
					.setCustomId("next")
					.setLabel("Next")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(page >= totalPages - 1)
			);

			await buttonInteraction.update({ embeds: [newEmbed], components: [newRow] });
		});

		buttonCollector.on("end", () => {
			row.components.forEach((button) => button.setDisabled(true));
			reply.edit({ components: [row] }).catch(console.error);
		});
	},
};
