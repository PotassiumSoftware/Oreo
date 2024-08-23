const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = {
    name: 'commandHandler',
    init: (client) => {
        client.once('botReady', async () => {
            await loadCommands(client);
        });
    }
};

async function loadCommands(client) {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = [];
    
    function readDirRecursive(dir) {
        fs.readdirSync(dir).forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.lstatSync(filePath).isDirectory()) {
                readDirRecursive(filePath);
            } else if (file.endsWith('.js')) {
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

    const rest = new REST({ version: '10' }).setToken(client.token);

    try {
        global.log.debug('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(client.user.id), {
            body: client.commands.map(command => command.data.toJSON()),
        });

        global.log.debug('Successfully reloaded application (/) commands.');
    } catch (error) {
        global.log.error(error);
    }
}
