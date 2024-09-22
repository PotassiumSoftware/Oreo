module.exports = {
	bot: {
		token: "", // Replace with your actual bot token
		debug: false,
		client_id: "", // Your bot's client ID
		presence: {
			type: "PLAYING", // Other types: WATCHING, LISTENING, STREAMING, etc.
			name: "", // Activity name
			url: "", // Optional, for streaming presence (e.g., Twitch URL)
		},
	},
	developers: {
		owner: "", // Owner's Discord ID
		admin: [], // List of admin Discord IDs
	},
	api: {
		omdb: {
			key: "", // Your OMDB API key (if applicable) Get it here: https://www.omdbapi.com/apikey.aspx 
		},
	},
	guild: {
		id: "", // Your guild's ID
		channels: {
			logs: {
				joins: "", // Channel ID for join logs
				user: "",  // Channel ID for user logs
			},
			counting: "", // Channel ID for counting game
		},
	},
	joiner: {
		channel: "", // Channel ID where new members join
		joinroles: [], // Array of role IDs to assign on join
	},
	emotes: {
		success: "", //Check the emotes folder!
		fail: "", //Applications can have up to 2000 emojis for the bot to use! Upload them here: https://discord.com/developers/applications/YOUR_APP_ID/emojis
		warn: "", //Or of course, just upload them to your server, using emotes in bots should look something like this: <:emoteName:1>
		welcome: "", 
	},
	embeds: {
		colors: {
			default: "#006aff", // Blue
			success: "#00d11c", // Green
			fail: "#d10000",    // Red
			warn: "#d1c000",    // Yellow
		},
	},
};
