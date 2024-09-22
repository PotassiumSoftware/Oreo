module.exports = {
	bot: {
		token: "",
		debug: false,
		client_id: "",
	},
	developers: {
		owner: "",
		admin: [],
	},
	api: {
        omdb: {
            key: "", //https://www.omdbapi.com/apikey.aspx
        }
    },
    guild: {
        id: "",
        channels: {
            counting: ""
        },
    },
	emotes: {
		success: "", //Check the emotes folder!
		fail: "", //Applications can have up to 2000 emojis for the bot to use! Upload them here: https://discord.com/developers/applications/YOUR_APP_ID/emojis
		warn: "", //Or of course, just upload them to your server, using emotes in bots should look something like this: <:emoteName:1>
	},
	embeds: {
		colors: {
			default: "#006aff",
			success: "#00d11c",
			fail: "#d10000",
			warn: "#d1c000",
		},
		footer_text: "",
		footer_icon: "",
	},
};
