const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/data.json');

module.exports = {
    config: {
        name: "balance",
        alias: ["bal"],
        version: "1.0.0",
        author: "Edinst",
        cooldown: 5,
        role: 0, // Tersedia untuk semua pengguna
        description: "Menampilkan saldo pengguna.",
        category: "Economy",
        guide: "/balance"
    },

    BotRun: async function(api, message, args) {
        const userID = message.senderID;
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        if (data.users[userID]) {
            const userBalance = data.users[userID].balance;
            api.sendMessage(`Saldo Anda adalah $${userBalance}.`, message.threadID);
        } else {
            api.sendMessage("Anda belum terdaftar dalam sistem.", message.threadID);
        }
    }
};
