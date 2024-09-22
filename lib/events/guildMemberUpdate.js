const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        global.log.debug(`guildMemberUpdate event received for user: ${newMember.user.username} (${newMember.user.id})`);

        const embeds = [];

        try {
            const oldRoles = oldMember.roles.cache.map(role => role.id);
            const newRoles = newMember.roles.cache.map(role => role.id);
            const addedRoles = newRoles.filter(role => !oldRoles.includes(role));
            const removedRoles = oldRoles.filter(role => !newRoles.includes(role));

            if (addedRoles.length || removedRoles.length) {
                global.log.debug(`Role update detected for user: ${newMember.user.username} (${newMember.user.id})`);

                const roleEmbed = new EmbedBuilder()
                    .setTitle('Role Update')
                    .addFields({ name: 'Added Roles', value: addedRoles.map(roleId => `<@&${roleId}>`).join(', ') || "None" })
                    .addFields({ name: 'Removed Roles', value: removedRoles.map(roleId => `<@&${roleId}>`).join(', ') || "None" })
                    .setColor(global.config.embeds.colors.default)
                    .setTimestamp()
                    .setAuthor({
                        name: newMember.user.username,
                        iconURL: newMember.user.displayAvatarURL(),
                    })
                    .setFooter({
                        text: `User ID: ${newMember.user.id}`,
                    });

                embeds.push(roleEmbed);
            }

            if (oldMember.nickname !== newMember.nickname) {
                global.log.debug(`Nickname update detected for user: ${newMember.user.username} (${newMember.user.id})`);

                const nicknameEmbed = new EmbedBuilder()
                    .setTitle('Nickname Update')
                    .addFields({ name: 'Old Nickname', value: oldMember.nickname || 'None' })
                    .addFields({ name: 'New Nickname', value: newMember.nickname || 'None' })
                    .setColor(global.config.embeds.colors.default)
                    .setTimestamp()
                    .setAuthor({
                        name: newMember.user.username,
                        iconURL: newMember.user.displayAvatarURL(),
                    })
                    .setFooter({
                        text: `User ID: ${newMember.user.id}`,
                    });

                embeds.push(nicknameEmbed);
            }

            if (oldMember.user.username !== newMember.user.username) {
                global.log.debug(`Username update detected for user: ${newMember.user.username} (${newMember.user.id})`);

                const usernameEmbed = new EmbedBuilder()
                    .setTitle('Username Update')
                    .addFields({ name: 'Old Username', value: oldMember.user.username })
                    .addFields({ name: 'New Username', value: newMember.user.username })
                    .setColor(global.config.embeds.colors.default)
                    .setTimestamp()
                    .setAuthor({
                        name: newMember.user.username,
                        iconURL: newMember.user.displayAvatarURL(),
                    })
                    .setFooter({
                        text: `User ID: ${newMember.user.id}`,
                    });

                embeds.push(usernameEmbed);
            }

            if (oldMember.user.displayAvatarURL() !== newMember.user.displayAvatarURL()) {
                global.log.debug(`Avatar update detected for user: ${newMember.user.username} (${newMember.user.id})`);

                const avatarEmbed = new EmbedBuilder()
                    .setTitle('Avatar Update')
                    .setColor(global.config.embeds.colors.default)
                    .setThumbnail(newMember.user.displayAvatarURL())
                    .setTimestamp()
                    .setAuthor({
                        name: newMember.user.username,
                        iconURL: newMember.user.displayAvatarURL(),
                    })
                    .setFooter({
                        text: `User ID: ${newMember.user.id}`,
                    });

                embeds.push(avatarEmbed);
            }

            if (embeds.length > 0) {
                const channelId = global.config.guild.channels.logs.user; 
                const channel = newMember.guild.channels.cache.get(channelId);

                if (channel) {
                    global.log.debug(`Sending ${embeds.length} embed(s) to the log channel for user: ${newMember.user.username} (${newMember.user.id})`);
                    for (const embed of embeds) {
                        await channel.send({ embeds: [embed] });
                    }
                } else {
                    global.log.warn(`Log channel not found for user: ${newMember.user.username} (${newMember.user.id})`);
                }
            }
        } catch (error) {
            global.log.error(`Error handling guildMemberUpdate event for user: ${newMember.user.username} (${newMember.user.id}): ${error.message}`);
        }
    },
};
