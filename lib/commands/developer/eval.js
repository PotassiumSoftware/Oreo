const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("Evaluate JavaScript code")
		.addStringOption((option) => option.setName("code").setDescription("The code to evaluate").setRequired(true)),
	permissions: [`Developer`],
	async execute(interaction) {
		const code = interaction.options.getString("code");

		if (code.length > 1000) {
			await interaction.reply({ content: "Code is too long. Please provide shorter code.", ephemeral: true });
			return;
		}

		const sensitivePatterns = [
			/token/i, // Matches 'token'
			/api_key/i, // Matches 'api_key'
			/password/i, // Matches 'password'
			/secret/i, // Matches 'secret'
			/client_secret/i, // Matches 'client_secret'
			/bearer\s+\w+/i, // Matches 'Bearer <token>'
			/config\.token/i, // Matches 'config.token'
			/config\.api_key/i, // Matches 'config.api_key'
			/client\.secret/i, // Matches 'client.secret'
			/client\.token/i, // Matches 'client.token'
			/client\.password/i, // Matches 'client.password'
			/process\.env\.TOKEN/i, // Matches 'process.env.TOKEN'
			/process\.env\.API_KEY/i, // Matches 'process.env.API_KEY'
			/discord\.token/i, // Matches 'discord.token'
			/discord\.api_key/i, // Matches 'discord.api_key'
			/client\.login/i, // Matches 'client.login'
			/client\.login\(.*\)/i, // Matches 'client.login(<token>)'
		];

		if (sensitivePatterns.some((pattern) => pattern.test(code))) {
			await interaction.reply({ content: "Your code contains potentially sensitive data and cannot be evaluated.", ephemeral: true });
			return;
		}

		const timeout = 5000;
		let result;

		try {
			result = await Promise.race([(async () => eval(code))(), new Promise((_, reject) => setTimeout(() => reject(new Error("Code execution timed out")), timeout))]);

			let resultString = String(JSON.stringify(result, null, 2));

			if (resultString.length <= 1987) {
				await interaction.reply({ content: `\`\`\`json\n${resultString}\n\`\`\``, ephemeral: true });
			} else {
				const resultChunks = [];
				while (resultString.length > 1987) {
					resultChunks.push(resultString.substring(0, 1987));
					resultString = resultString.substring(1987);
				}
				resultChunks.push(resultString);

				for (const chunk of resultChunks) {
					await interaction.reply({ content: `\`\`\`json\n${chunk}\n\`\`\``, ephemeral: true });
				}
			}
		} catch (error) {
			let errorString = error.toString();

			if (errorString.length <= 1987) {
				await interaction.reply({ content: `\`\`\`json\n${errorString}\n\`\`\``, ephemeral: true });
			} else {
				const errorChunks = [];
				while (errorString.length > 1987) {
					errorChunks.push(errorString.substring(0, 1987));
					errorString = errorString.substring(1987);
				}
				errorChunks.push(errorString);

				for (const chunk of errorChunks) {
					await interaction.reply({ content: `\`\`\`json\n${chunk}\n\`\`\``, ephemeral: true });
				}
			}
		}
	},
};
