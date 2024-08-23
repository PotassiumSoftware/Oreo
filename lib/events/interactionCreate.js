const { PermissionsBitField } = require('discord.js');
const fs = require('fs'); 

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

        const username = interaction.user.username;
        const userId = interaction.user.id;
        const commandName = interaction.commandName;
        const commandArgs = interaction.options.data.map(option => `${option.name}: ${option.value}`).join(' ');

        const getFormattedTimestamp = () => {
            const now = new Date();
            const dateOptions = {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            };
            const timeOptions = {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            };
            const date = now.toLocaleDateString("de-DE", dateOptions);
            const time = now.toLocaleTimeString("de-DE", timeOptions);
            return `${date} ${time}`;
        };

        const logEntry = `${getFormattedTimestamp()} - User: ${username} (${userId}) - Command: ${commandName} ${commandArgs}\n`;

        fs.appendFile('./logs/commands.txt', logEntry, (err) => {
            if (err) console.error('Failed to write log:', err);
        });

        try {
            command.execute(interaction);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};
