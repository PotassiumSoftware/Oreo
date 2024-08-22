const { Message } = require('discord.js');

module.exports = {
  data: {
    name: 'eval',
    description: 'Evaluate JavaScript code',
  },
  async execute(message, args) {
    if (!args || args.length === 0) {
      message.reply('Please provide code to evaluate.');
      return;
    }

    const code = args.join(' ');


    if (code.length > 1000) {
      message.reply('Code is too long. Please provide shorter code.');
      return;
    }
    const sensitivePatterns = [
      /token/i,                 // Matches 'token'
      /api_key/i,               // Matches 'api_key'
      /password/i,              // Matches 'password'
      /secret/i,                // Matches 'secret'
      /client_secret/i,         // Matches 'client_secret'
      /bearer\s+\w+/i,          // Matches 'Bearer <token>'
      /config\.token/i,         // Matches 'config.token'
      /config\.api_key/i,       // Matches 'config.api_key'
      /client\.secret/i,        // Matches 'client.secret'
      /client\.token/i,         // Matches 'client.token'
      /client\.password/i,      // Matches 'client.password'
      /process\.env\.TOKEN/i,   // Matches 'process.env.TOKEN'
      /process\.env\.API_KEY/i, // Matches 'process.env.API_KEY'
      /discord\.token/i,        // Matches 'discord.token'
      /discord\.api_key/i,      // Matches 'discord.api_key'
      /client\.login/i,         // Matches 'client.login'
      /client\.login\(.*\)/i,   // Matches 'client.login(<token>)'
    ];

    if (sensitivePatterns.some(pattern => pattern.test(code))) {
      message.reply('Your code contains potentially sensitive data and cannot be evaluated.');
      return;
    }

    const timeout = 5000; 
    let result;
    
    try {
      result = await Promise.race([
        (async () => eval(code))(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Code execution timed out')), timeout))
      ]);

      let resultString = String(JSON.stringify(result, null, 2));

      if (resultString.length <= 1987) {
        message.reply(`\`\`\`json\n${resultString}\n\`\`\``);
      } else {
        const resultChunks = [];
        while (resultString.length > 1987) {
          resultChunks.push(resultString.substring(0, 1987));
          resultString = resultString.substring(1987);
        }
        resultChunks.push(resultString);
        
        for (const chunk of resultChunks) {
          message.reply(`\`\`\`json\n${chunk}\n\`\`\``);
        }
      }
    } catch (error) {
      let errorString = error.toString();

      if (errorString.length <= 1987) {
        message.reply(`\`\`\`json\n${errorString}\n\`\`\``);
      } else {
        const errorChunks = [];
        while (errorString.length > 1987) {
          errorChunks.push(errorString.substring(0, 1987));
          errorString = errorString.substring(1987);
        }
        errorChunks.push(errorString);

        for (const chunk of errorChunks) {
          message.reply(`\`\`\`json\n${chunk}\n\`\`\``);
        }
      }
    }
  },
};
