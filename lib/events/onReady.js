module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        global.log.info(`Bot running! Now logged in as ${client.user.tag}!`);
        client.emit('botReady');
    },
};
