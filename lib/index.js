const log = require("./utils/logs.js");
const fs = require("fs");
const path = require("path");
const { Client, ActivityType, Events, Collection } = require("discord.js");
const { REST, Routes } = require("discord.js");
const config = require("../config/main.js");

log.start();

const args = process.argv.slice(2);
const debugEnable = args.includes("--debug") || args.includes("-d") || config.debug;

module.exports = {
	debugEnable: args.includes("--debug") || args.includes("-d") || config.debug,
};

if (debugEnable) {
	log.warn("Debug is enabled!");
}

const client = new Client({ intents: 3276799 });

client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

const commands = [];

for (const folder of commandFolders) {
	if (folder.toLowerCase() === "developer") {
		continue;
	}

	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
			if (debugEnable) {
				client.commands.set(command.data.name, command);
				log.debug(`Slash command "${command.data.name}" registered.`);
			} else {
				client.commands.set(command.data.name, command);
			}
			commands.push(command.data);
		} else {
			log.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.once(Events.ClientReady, async () => {
	log.info(`Ready! Logged in as ${client.user.tag}`);

	client.user.setPresence({
		activities: [
			{
				type: ActivityType + config.status.activityType,
				name: config.status.name,
				state: config.status.state,
				url: config.status.url,
			},
		],
	});

	client.user.setStatus(config.status.statusType);

	const rest = new REST({ version: "10" }).setToken(config.token);

	try {
		log.info(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(Routes.applicationCommands(config.clientId), { body: commands });

		log.info(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		log.error(error);
	}
});

client.login(config.token);
