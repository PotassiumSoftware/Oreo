const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'userUpdate',
    async execute(oldUser, newUser) {
        global.log.debug(`userUpdate event received for user: ${newUser.username} (${newUser.id})`);

        const embeds = [];

        try {
            if (oldUser.username !== newUser.username) {
                global.log.debug(`Username update detected for user: ${newUser.username} (${newUser.id})`);

                const usernameEmbed = new EmbedBuilder()
                    .setTitle('Username Update')
                    .addFields(
                        { name: 'Old Username', value: oldUser.username },
                        { name: 'New Username', value: newUser.username }
                    )
                    .setColor(global.config.embeds.colors.default)
                    .setTimestamp()
                    .setAuthor({
                        name: newUser.username,
                        iconURL: newUser.displayAvatarURL(),
                    })
                    .setFooter({
                        text: `User ID: ${newUser.id}`,
                    });

                embeds.push(usernameEmbed);
            }

            if (oldUser.avatar !== newUser.avatar) {
                global.log.debug(`Avatar update detected for user: ${newUser.username} (${newUser.id})`);

                const avatarEmbed = new EmbedBuilder()
                    .setTitle('Avatar Update')
                    .setColor(global.config.embeds.colors.default)
                    .setThumbnail(newUser.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setDescription(`Download as [PNG](${newUser.displayAvatarURL({ format: 'png', size: 1024 })}) | [JPG](${newUser.displayAvatarURL({ format: 'jpg', size: 1024 })}) | [WebP](${newUser.displayAvatarURL({ format: 'webp', size: 1024 })})`)
                    .setTimestamp()
                    .setAuthor({
                        name: newUser.username,
                        iconURL: newUser.displayAvatarURL(),
                    })
                    .setFooter({
                        text: `User ID: ${newUser.id}`,
                    });

                if (!newUser.avatar) {
                    avatarEmbed.setTitle('Avatar Removed');
                } else if (!oldUser.avatar) {
                    avatarEmbed.setTitle('Avatar Set');
                } else {
                    avatarEmbed.setTitle('Avatar Updated');
                }

                embeds.push(avatarEmbed);
            }

            if (embeds.length > 0) {
                const channelId = global.config.guild.channels.logs.user;
                const channel = newUser.client.channels.cache.get(channelId);

                if (channel) {
                    global.log.debug(`Sending ${embeds.length} embed(s) to the log channel for user: ${newUser.username} (${newUser.id})`);
                    for (const embed of embeds) {
                        await channel.send({ embeds: [embed] });
                    }
                } else {
                    global.log.warn(`Log channel not found for user: ${newUser.username} (${newUser.id})`);
                }
            }
        } catch (error) {
            global.log.error(`Error handling userUpdate event for user: ${newUser.username} (${newUser.id}): ${error.message}`);
        }
    },
};
