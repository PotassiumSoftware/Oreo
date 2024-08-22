const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const config = require("../../../config/main.js");
const emotes = require("../../../config/emotes.json")
const developersPath = path.join(__dirname, "..", "..", "..", "config", "developers.json");

module.exports = {
	data: {
		name: "developer",
		description: "Manage developer IDs by adding, removing, or listing them",
	},
	async execute(message, args) {
		const action = args.shift()?.toLowerCase();
		const userId = args[0]?.replace(/[<@!>]/g, "");

		if (!["add", "remove", "list"].includes(action)) {
			const embed = new EmbedBuilder().setColor("#ED4245").setDescription(emotes.fail + " | Invalid action. Use `add`, `remove`, or `list`.");
			return message.reply({ embeds: [embed] });
		}

		if (message.author.id !== config.ownerId) {
			const embed = new EmbedBuilder().setColor("#ED4245").setDescription(emotes.fail + " | You do not have permission to use this command.");
			return message.reply({ embeds: [embed] });
		}

		if ((action === "add" || action === "remove") && !userId) {
			const embed = new EmbedBuilder().setColor("#ED4245").setDescription(emotes.fail + " | Please specify a user ID or mention.");
			return message.reply({ embeds: [embed] });
		}

		try {
			const developerIds = JSON.parse(fs.readFileSync(developersPath, "utf8"));

			if (action === "add" || action === "remove") {
				let user = null;

				if (userId) {
					user = await message.client.users.fetch(userId).catch(() => null);
				}

				if (action === "add") {
					if (!user) {
						const embed = new EmbedBuilder().setColor("#ED4245").setDescription(emotes.fail + " | The specified user does not exist or is not reachable.");
						return message.reply({ embeds: [embed] });
					}

					if (!developerIds.includes(userId)) {
						developerIds.push(userId);
						fs.writeFileSync(developersPath, JSON.stringify(developerIds, null, 2));
						const embed = new EmbedBuilder().setColor("#57F287").setDescription(emotes.success + ` | **__${user.username}__** (${userId}) has been added to the developer list.`);
						return message.reply({ embeds: [embed] });
					} else {
						const embed = new EmbedBuilder().setColor("#FFFF00").setDescription(emotes.warn + ` | **__${user.username}__** (${userId}) is already a developer.`);
						return message.reply({ embeds: [embed] });
					}
				} else if (action === "remove") {
					const index = developerIds.indexOf(userId);
					if (index !== -1) {
						developerIds.splice(index, 1);
						fs.writeFileSync(developersPath, JSON.stringify(developerIds, null, 2));
						const embed = new EmbedBuilder()
							.setColor("#57F287")
							.setDescription(emotes.success + ` | **__${user ? `${user.username}` : `USER_NOT_FOUND`}__** (${userId}) has been removed from the developer list.`);
						return message.reply({ embeds: [embed] });
					} else {
						const embed = new EmbedBuilder()
							.setColor("#FFFF00")
							.setDescription(emotes.warn + ` | **__${user ? `${user.username}` : `USER_NOT_FOUND`}__** (${userId}) is not in the developer list.`);
						return message.reply({ embeds: [embed] });
					}
				}
			} else if (action === "list") {
				if (developerIds.length === 0) {
					const embed = new EmbedBuilder().setColor("#FFFF00").setDescription(emotes.warn + " | The developer list is currently empty.");
					return message.reply({ embeds: [embed] });
				}

				const usernames = await Promise.all(
					developerIds.map(async (id) => {
						try {
							const user = await message.client.users.fetch(id);
							return `**__${user.username}__** (${id})`;
						} catch {
							return `**__USER_NOT_FOUND__** (${id})`;
						}
					})
				);

				const embed = new EmbedBuilder()
					.setColor("#3498DB")
					.setTitle("Current Developers")
					.setDescription(`${usernames.join("\n")}`);
				return message.reply({ embeds: [embed] });
			}
		} catch (error) {
			console.error("An error occurred while processing the command:", error);
			const embed = new EmbedBuilder().setColor("#ED4245").setDescription(emotes.fail + " | An error occurred while processing your request. Please try again later.");
			return message.reply({ embeds: [embed] });
		}
	},
};
