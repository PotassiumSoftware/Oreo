const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs");
const path = require("path");
const { Collection } = require("discord.js");

module.exports = {
	name: "commandHandler",
	init: (client) => {
		client.once("botReady", async () => {
			await loadCommands(client);
		});
	},
};

async function loadCommands(client) {
	const commandsPath = path.join(__dirname, "../commands");
	const commandFiles = [];

	function readDirRecursive(dir) {
		fs.readdirSync(dir).forEach((file) => {
			const filePath = path.join(dir, file);
			if (fs.lstatSync(filePath).isDirectory()) {
				readDirRecursive(filePath);
			} else if (file.endsWith(".js")) {
				commandFiles.push(filePath);
			}
		});
	}

	readDirRecursive(commandsPath);

	client.commands = new Collection();

	for (const filePath of commandFiles) {
		const command = require(filePath);

		if (command.data && command.execute) {
			client.commands.set(command.data.name, command);
			global.log.debug(`Loaded command: ${command.data.name}`);
		} else {
			global.log.warn(`Command file ${path.basename(filePath)} is missing required properties.`);
		}
	}

	const rest = new REST({ version: "10" }).setToken(client.token);

	try {
		global.log.debug("Started refreshing application (/) commands.");

		await client.application.commands.set([]);
		global.log.debug("Successfully cleared global commands.");

		const guilds = client.guilds.cache;
		for (const [guildId, guild] of guilds) {
			try {
				/*
                await guild.commands.set([]);
                global.log.debug(`Successfully cleared commands for guild ${guildId}.`);
                */
				const commandData = client.commands.map((command) => command.data.toJSON());
				await guild.commands.set(commandData);
				global.log.debug(`Successfully reloaded commands for guild ${guildId}.`);
			} catch (guildError) {
				global.log.error(`Failed to update commands for guild ${guildId}: ` + guildError, false);
			}
		}

		global.log.debug("Successfully reloaded application (/) commands for all guilds.");
	} catch (error) {
		global.log.error("Error refreshing application commands: " + error, false);
	}
}
