const dataHandler = require('./dataHandler.js');

module.exports = {
    name: "countingHandler",
    init: (client) => {
        let currentCount = 0; 
        let lastUserId = null; 

        try {
            const guildData = dataHandler.getGuildData(); 
            currentCount = guildData.counting.count || 0; 
            lastUserId = guildData.counting.lastUser || null; 
            log.debug(`Loaded initial count: ${currentCount}, lastUserId: ${lastUserId}`);
        } catch (error) {
            log.error('Error loading initial data: ' + error,  false);
        }

        client.on('messageCreate', async (message) => {
            if (message.author.bot) return;

            const countingChannelId = global.config.guild.channels.counting;
            if (message.channel.id !== countingChannelId) return;

            const messageContent = message.content;
            let userNumber;

            try {

                userNumber = eval(messageContent);
                if (isNaN(userNumber)) throw new Error("Not a number");
                log.debug(`Evaluated number: ${userNumber}`);
            } catch (error) {
                log.debug('Deleting invalid message: ', messageContent);
                await message.delete();
                return;
            }

            const isFirstCount = currentCount === 0 && userNumber === 1;
            if (!isFirstCount && message.author.id === lastUserId) {
                log.debug('User tried to count twice in a row: ', message.author.id);
                currentCount = 0;
                try {
                    const guildData = dataHandler.getGuildData();
                    guildData.counting.count = currentCount;
                    guildData.counting.lastUser = null;
                    dataHandler.saveGuildData(guildData);
                } catch (error) {
                    log.error('Error resetting count: ' + error,  false);
                }
                await message.react(global.config.emotes.fail);
                await message.reply(`You can't count twice in a row! Try again with ${currentCount + 1}.`);
                return;
            }

            try {
                if (userNumber === currentCount + 1) {
                    log.debug(`User ${message.author.id} counted correctly: ${userNumber}`);
                    currentCount = userNumber;
                    lastUserId = message.author.id;
                    try {
                        const guildData = dataHandler.getGuildData();
                        guildData.counting.count = currentCount;
                        guildData.counting.lastUser = lastUserId;
                        dataHandler.saveGuildData(guildData);
                    } catch (error) {
                        log.error('Error updating count: ' + error,  false);
                    }
                    await message.react(global.config.emotes.success);
                } else {
                    log.debug('User counted incorrectly. Resetting count.');
                    currentCount = 0;
                    lastUserId = null; 
                    try {
                        const guildData = dataHandler.getGuildData();
                        guildData.counting.count = currentCount;
                        guildData.counting.lastUser = null;
                        dataHandler.saveGuildData(guildData);
                    } catch (error) {
                        log.error('Error resetting count: ' + error,  false);
                    }
                    await message.react(global.config.emotes.fail);
                    await message.reply(`Invalid number! The count has been reset to 0. Try again with ${currentCount + 1}.`);
                }
            } catch (error) {
                log.error('Error handling count message: ' + error,  false);
            }
        });
    },
};
