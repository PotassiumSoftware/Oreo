const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../config.js"); 

module.exports = {
	data: new SlashCommandBuilder()
		.setName("developer")
		.setDescription("Manage developer IDs by adding, removing, or listing them")
		.addStringOption((option) =>
			option
				.setName("action")
				.setDescription("Action to perform: add, remove, or list")
				.setRequired(true)
				.addChoices({ name: "Add", value: "add" }, { name: "Remove", value: "remove" }, { name: "List", value: "list" })
		)
		.addUserOption((option) => option.setName("user").setDescription("User to add or remove (required for add/remove)")),
	permissions: [`Developer`],
	async execute(interaction) {
		const action = interaction.options.getString("action").toLowerCase();
		const user = interaction.options.getUser("user");
		const userId = user ? user.id : null;

        if ((action === "add" || action === "remove") && !userId) {
			const embed = new EmbedBuilder().setColor(global.config.embeds.colors.fail).setDescription(`${global.config.emotes.fail} Please specify a user.`);
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		try {
			const developerIds = global.config.developers.admin;

			if (action === "add" || action === "remove") {
				let userObject = null;

                if (interaction.user.id !== global.config.developers.owner) {
                    const embed = new EmbedBuilder().setColor(global.config.embeds.colors.fail).setDescription(`${global.config.emotes.fail} You do not have permission to use this command.`);
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }

				if (userId) {
					userObject = await interaction.client.users.fetch(userId).catch(() => null);
				}

				if (action === "add") {
					if (!userObject) {
						const embed = new EmbedBuilder()
							.setColor(global.config.embeds.colors.fail)
							.setDescription(`${global.config.emotes.fail} The specified user does not exist or is not reachable.`);
						return interaction.reply({ embeds: [embed], ephemeral: true });
					}

					if (!developerIds.includes(userId)) {
						developerIds.push(userId);
						global.config.developers.admin = developerIds; 

						fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(global.config, null, 2)};`);

						const embed = new EmbedBuilder()
							.setColor(global.config.embeds.colors.success)
							.setDescription(`${global.config.emotes.success} **__${userObject.username}__** (${userId}) has been added to the developer list.`);
						return interaction.reply({ embeds: [embed] });
					} else {
						const embed = new EmbedBuilder()
							.setColor(global.config.embeds.colors.warn)
							.setDescription(`${global.config.emotes.warn} **__${userObject.username}__** (${userId}) is already a developer.`);
						return interaction.reply({ embeds: [embed] });
					}
				} else if (action === "remove") {
					const index = developerIds.indexOf(userId);
					if (index !== -1) {
						developerIds.splice(index, 1);
						global.config.developers.admin = developerIds; 

						fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(global.config, null, 2)};`);

						const embed = new EmbedBuilder()
							.setColor(global.config.embeds.colors.success)
							.setDescription(`${global.config.emotes.success} **__${userObject ? userObject.username : "USER_NOT_FOUND"}__** (${userId}) has been removed from the developer list.`);
						return interaction.reply({ embeds: [embed], ephemeral: true });
					} else {
						const embed = new EmbedBuilder()
							.setColor(global.config.embeds.colors.warn)
							.setDescription(`${global.config.emotes.warn} **__${userObject ? userObject.username : "USER_NOT_FOUND"}__** (${userId}) is not in the developer list.`);
						return interaction.reply({ embeds: [embed], ephemeral: true });
					}
				}
			} else if (action === "list") {
				if (developerIds.length === 0) {
					const embed = new EmbedBuilder().setColor(global.config.embeds.colors.warn).setDescription(`${global.config.emotes.warn} The developer list is currently empty.`);
					return interaction.reply({ embeds: [embed], ephemeral: true });
				}

				const usernames = await Promise.all(
					developerIds.map(async (id) => {
						try {
							const user = await interaction.client.users.fetch(id);
							return `**__${user.username}__** (${id})`;
						} catch {
							return `**__ERR_USER_NOT_FOUND__** (${id})`;
						}
					})
				);

				const embed = new EmbedBuilder()
					.setColor(global.config.embeds.colors.default)
					.setTitle("Current Developers")
					.setDescription(`${usernames.join("\n")}`);
				return interaction.reply({ embeds: [embed] });
			}
		} catch (error) {
			log.error("An error occurred while processing the command:" + error, false);
			const embed = new EmbedBuilder()
				.setColor(global.config.embeds.colors.fail)
				.setDescription(`${global.config.emotes.fail} An error occurred while processing your request. Please try again later.`);
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}
	},
};