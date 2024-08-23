const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    once: false,
    execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            return interaction.reply({ content: 'Command not found.', ephemeral: true });
        }

        if (command.permissions) {
            const requiredPermissions = command.permissions;

            if (requiredPermissions.includes('Developer')) {
                const isOwner = interaction.user.id === global.config.developers.owner;
                const isAdmin = global.config.developers.admin.includes(interaction.user.id);

                if (!isOwner && !isAdmin) {
                    return interaction.reply({ 
                        content: 'This command is for developers only!', 
                        ephemeral: true 
                    });
                }
            } else {
                const memberPermissions = new PermissionsBitField(interaction.member.permissions);
                const missingPermissions = requiredPermissions.filter(permission => !memberPermissions.has(permission));

                if (missingPermissions.length > 0) {
                    const missingPermissionsList = missingPermissions
                        .map(permission => {
                            for (const [key, value] of Object.entries(PermissionsBitField.Flags)) {
                                if (value === permission) return key;
                            }
                            return 'Unknown Permission';
                        })
                        .join(', ');

                    return interaction.reply({ 
                        content: `You do not have the following permissions to use this command: ${missingPermissionsList}`, 
                        ephemeral: true 
                    });
                }
            }
        }

        try {
            command.execute(interaction);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};
