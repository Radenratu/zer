const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../config.json');

module.exports = {
    config: {
        name: "prefix",
        alias: [],
        version: "1.0.0",
        author: "Edinst",
        cooldown: 5,
        role: 2, // Hanya admin yang dapat menggunakan command ini
        description: "Mengubah atau menampilkan prefix bot.",
        category: "System",
        guide: "/prefix [prefix baru] untuk mengubah prefix atau gunakan /prefix untuk melihat prefix saat ini."
    },

    BotRun: async function(api, message, args) {
        const senderID = message.senderID;
        let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        if (args.length === 0) {
            // Jika tidak ada argumen, tampilkan prefix saat ini
            return api.sendMessage(`Prefix saat ini adalah: "${config.prefix}"`, message.threadID);
        }

        // Pastikan pengguna adalah admin
        if (!config.adminID.includes(senderID)) {
            return api.sendMessage("Anda tidak memiliki izin untuk mengubah prefix.", message.threadID);
        }

        // Ubah prefix
        const newPrefix = args[0];
        config.prefix = newPrefix;

        // Simpan perubahan ke config.json
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        return api.sendMessage(`Prefix berhasil diubah menjadi: "${newPrefix}"`, message.threadID);
    }
};
      
