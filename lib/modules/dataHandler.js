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

        setInterval(() => {
            module.exports.expireCases(); 
        }, 30 * 1000); 
    },
    getGuildData: () => loadJSON("guild.json"),
    saveGuildData: (data) => saveJSON("guild.json", data),
    getModerationData: () => loadJSON("moderation.json"),
    saveModerationData: (data) => saveJSON("moderation.json", data),
    getUserData: (userId) => loadUser(userId),
    saveUserData: (userId, newData) => saveUser(userId, newData),
    addModerationCase: (type, duration, moderatorId, affectedUser, reason, moderatorNote) => {
        let moderationData = loadJSON("moderation.json") || [];
        const newCaseId = moderationData.length > 0 ? Math.max(...moderationData.map(c => c.case_id)) + 1 : 1;

        const timestamp = Date.now();
        const expiresAt = timestamp + duration;

        const newCase = {
            case_id: newCaseId,
            type,
            expires_at: expiresAt,
            expired: false,
            timestamp,
            moderator_id: moderatorId,
            affected_user: affectedUser,
            reason,
            moderator_note: moderatorNote,
        };

        moderationData.push(newCase);
        saveJSON("moderation.json", moderationData);
    },

    expireCases: () => {
        const moderationData = loadJSON("moderation.json") || [];
        const currentTime = Date.now();

        moderationData.forEach(caseObj => {
            if (caseObj.expires_at && currentTime > caseObj.expires_at && !caseObj.expired) {
                caseObj.expired = true;
                console.log(`Case ${caseObj.case_id} for user ${caseObj.affected_user} has expired.`);
            }
        });

        saveJSON("moderation.json", moderationData); 
    },
};


function loadJSON(fileName) {
    const filePath = path.join(__dirname, "../../data", fileName);
    if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath);
        return JSON.parse(rawData);
    }
    return []; 
}

function saveJSON(fileName, data) {
    const filePath = path.join(__dirname, "../../data", fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadUsers() {
    const usersDir = path.join(__dirname, "../../data/users");
    if (!fs.existsSync(usersDir)) {
        fs.mkdirSync(usersDir, { recursive: true });
    }
    const users = {};
    fs.readdirSync(usersDir).forEach(file => {
        if (file.endsWith(".json")) {
            const userId = path.basename(file, ".json");
            users[userId] = loadUser(userId);
        }
    });
    return users;
}

function loadUser(userId) {
    const userPath = path.join(__dirname, "../../data/users", `${userId}.json`);
    if (fs.existsSync(userPath)) {
        const rawData = fs.readFileSync(userPath);
        return JSON.parse(rawData);
    }
    return {}; 
}

function saveUser(userId, data) {
    const userPath = path.join(__dirname, "../../data/users", `${userId}.json`);
    fs.mkdirSync(path.dirname(userPath), { recursive: true });
    fs.writeFileSync(userPath, JSON.stringify(data, null, 2));
}
