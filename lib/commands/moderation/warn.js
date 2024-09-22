const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const dataHandler = require("../../modules/dataHandler.js");

module.exports = {
    permissions: [PermissionsBitField.Flags.ManageMessages],
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a user.")
        .addUserOption((option) => option.setName("user").setDescription("The user to warn.").setRequired(true))
        .addStringOption((option) => option.setName("reason").setDescription("The reason for the warning.").setRequired(true))
        .addStringOption((option) => option.setName("note").setDescription("A note visible to other moderators.").setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");
        const moderatorNote = interaction.options.getString("note") || "No additional notes provided.";
        const timestamp = Date.now();
        const expiresAt = null;

        try {
            dataHandler.addModerationCase("warn", expiresAt, timestamp, interaction.user.id, targetUser.id, reason, moderatorNote);
        } catch (error) {
            console.error("Error adding moderation case:", error, false);
            return await interaction.reply({ content: "There was an error recording the warning.", ephemeral: true });
        }

        const userEmbed = new EmbedBuilder()
            .setTitle("Warning Received!")
            .setDescription(`You have been warned for the following reason: **${reason}**`)
            .setColor(global.config.embeds.colors.fail); 

        let dmMessage;

        try {
            await targetUser.send({ embeds: [userEmbed] });
            dmMessage = "";
        } catch (error) {
            global.log.debug(`Failed to send DM to ${targetUser.username}.`);
            dmMessage = "I was unable to DM them. ";
        }

        const embed = new EmbedBuilder()
            .setDescription(`${global.config.emotes.success} **${targetUser.username}** has been warned. ${dmMessage}| **${reason}**`)
            .setColor(global.config.embeds.colors.success);


        try {
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error("Error replying to interaction:", error, false);
        }
    },
};
