const { Client, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
global.log = require('./utils/logs.js');
global.config = require('./config.js');

log.startup
const client = new Client({ intents: 3276799 });

if(config.bot.debug) {
    log.warn ("Debug mode is enabled!")
}

client.commands = new Collection();
client.cooldowns = new Collection();
client.models = new Collection();
client.buttons = new Collection();
client.events = new Collection();
client.modules = new Collection();

global.guildInvites = new Map();

const moduleDir = path.join(__dirname, "modules");
const modules = {};

global.modules = modules;

fs.readdirSync(moduleDir)
    .filter((file) => file.endsWith('.js'))
    .forEach((file) => {
        const modulePath = path.join(moduleDir, file);
        const Module = require(modulePath);

        if (Module.name) {
            global.modules[Module.name] = Module;
            log.debug(`Loaded module: ${Module.name}`);
        } else {
            log.debug(`Loaded module: ${file} | Please specify a name for this module!`);
        }
    });

Object.values(global.modules).forEach((module) => {
    if (typeof module.init === 'function') {
        module.init(client);
    }
});

client.login(config.bot.token);
