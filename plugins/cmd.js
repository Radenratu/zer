const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: "cmd",
        alias: [],
        version: "1.1.0",
        author: "Edinst",
        cooldown: 10,
        role: 2, // Hanya admin
        description: "Mengelola perintah bot (install, load, unload, delete).",
        category: "System",
        guide: "/cmd install <file.js> <kode/link>\n/cmd load <file.js>\n/cmd unload <file.js>\n/cmd del <file.js>"
    },

    BotRun: async function(api, message, args) {
        const [action, cmdFile] = args;
        const pluginsDir = path.join(__dirname);
        const configPath = path.join(__dirname, '../config.json');
        let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        try {
            if (action === 'install') {
                const fileName = args[1];
                const fileData = args.slice(2).join(" ");  // Mendukung kode atau link

                // Jika yang diberikan adalah URL, fetch dan simpan command dari URL
                if (fileData.startsWith('http')) {
                    const response = await axios.get(fileData);
                    fs.writeFileSync(path.join(pluginsDir, fileName), response.data, 'utf8');
                } else {
                    // Jika berupa kode langsung, simpan sebagai file
                    fs.writeFileSync(path.join(pluginsDir, fileName), fileData, 'utf8');
                }

                return api.sendMessage(`Command ${fileName} berhasil diinstal.`, message.threadID);
            }

            if (action === 'load') {
                if (config.unloadedCmds.includes(cmdFile)) {
                    config.unloadedCmds = config.unloadedCmds.filter(cmd => cmd !== cmdFile);
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                    return api.sendMessage(`Command ${cmdFile} berhasil dimuat ulang.`, message.threadID);
                } else {
                    return api.sendMessage(`Command ${cmdFile} sudah aktif.`, message.threadID);
                }
            }

            if (action === 'unload') {
                if (!config.unloadedCmds.includes(cmdFile)) {
                    config.unloadedCmds.push(cmdFile);
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                    return api.sendMessage(`Command ${cmdFile} berhasil dimatikan sementara.`, message.threadID);
                } else {
                    return api.sendMessage(`Command ${cmdFile} sudah dimatikan.`, message.threadID);
                }
            }

            if (action === 'del') {
                const commandPath = path.join(pluginsDir, cmdFile);
                if (fs.existsSync(commandPath)) {
                    fs.unlinkSync(commandPath);
                    return api.sendMessage(`Command ${cmdFile} berhasil dihapus.`, message.threadID);
                } else {
                    return api.sendMessage(`Command ${cmdFile} tidak ditemukan.`, message.threadID);
                }
            }

            api.sendMessage("Perintah tidak valid. Gunakan /cmd [install|load|unload|del].", message.threadID);
        } catch (error) {
            console.error(error);
            api.sendMessage("Terjadi kesalahan saat mengelola command.", message.threadID);
        }
    }
};
