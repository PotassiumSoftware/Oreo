const fs = require("fs");
const path = require("path");

module.exports = {
	name: "dataHandler",
	init: (client) => {
		client.data = {
			guild: loadJSON("guild.json"),
			moderation: loadJSON("moderation.json"),
			users: loadUsers(),
		};
	},
	getGuildData: () => {
		return loadJSON("guild.json");
	},
	saveGuildData: (data) => {
		saveJSON("guild.json", data);
	},
	getModerationData: () => {
		return loadJSON("moderation.json");
	},
	saveModerationData: (data) => {
		saveJSON("moderation.json", data);
	},
	getUserData: (userId) => {
		return loadUser(userId);
	},
	saveUserData: (userId, data) => {
		saveUser(userId, data);
	},
};

function loadJSON(fileName) {
	const filePath = path.join(__dirname, "../../data", fileName);
	try {
		if (fs.existsSync(filePath)) {
			const rawData = fs.readFileSync(filePath);
			return JSON.parse(rawData);
		} else {
			return {}; 
		}
	} catch (error) {
		global.log.error(`Failed to load JSON file: ${fileName}`, error);
		return {};
	}
}

function saveJSON(fileName, data) {
	const filePath = path.join(__dirname, "../../data", fileName);
	try {
		fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
	} catch (error) {
		global.log.error(`Failed to save JSON file: ${fileName}`, error);
	}
}

function loadUsers() {
	const usersDir = path.join(__dirname, "../../data/users");
	if (!fs.existsSync(usersDir)) {
		fs.mkdirSync(usersDir, { recursive: true });
	}
	const users = {};
	fs.readdirSync(usersDir).forEach((file) => {
		if (file.endsWith(".json")) {
			const userId = path.basename(file, ".json");
			users[userId] = loadUser(userId);
		}
	});
	return users;
}

function loadUser(userId) {
	const userPath = path.join(__dirname, "../../data/users", `${userId}.json`);
	try {
		if (fs.existsSync(userPath)) {
			const rawData = fs.readFileSync(userPath);
			return JSON.parse(rawData);
		} else {
			return {}; 
		}
	} catch (error) {
		global.log.error(`Failed to load user data: ${userId}`, error);
		return {};
	}
}

function saveUser(userId, data) {
	const userPath = path.join(__dirname, "../../data/users", `${userId}.json`);
	try {
		fs.writeFileSync(userPath, JSON.stringify(data, null, 2));
	} catch (error) {
		global.log.error(`Failed to save user data: ${userId}`, error);
	}
}
