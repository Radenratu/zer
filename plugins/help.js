const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "help",
        alias: ["commands"],
        version: "1.1.0",
        author: "Your Name",
        cooldown: 5,
        role: 0,
        description: "Menampilkan daftar perintah atau informasi perintah tertentu.",
        category: "General",
        guide: "/help [command]"
    },

    BotRun: async function(api, message, args) {
        try {
            const pluginsDir = path.join(__dirname);
            const commandFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
            const isSpecificCommand = args.length > 0;
            const { unloadedCmds } = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json')));

            if (isSpecificCommand) {
                // Show detailed information for a specific command
                const commandName = args[0].toLowerCase();
                const commandFile = commandFiles.find(file => {
                    const command = require(path.join(pluginsDir, file));
                    return command.config.name === commandName || command.config.alias.includes(commandName);
                });

                if (commandFile) {
                    const command = require(path.join(pluginsDir, commandFile));
                    const { name, alias, description, version, cooldown, role, guide } = command.config;

                    const roleText = role === 0 ? "User" : role === 1 ? "Moderator" : "Admin";
                    let response = `Nama: ${name}\nAlias: ${alias.join(", ")}\nDeskripsi: ${description}\nVersi: ${version}\nCooldown: ${cooldown} detik\nRole: ${roleText}\nPanduan: ${guide}`;
                    return api.sendMessage(response, message.threadID);
                } else {
                    return api.sendMessage(`Perintah ${commandName} tidak ditemukan.`, message.threadID);
                }
            }

            // List all available commands
            let helpMessage = "Daftar Perintah:\n\n";
            for (const file of commandFiles) {
                const command = require(path.join(pluginsDir, file));
                const { name, alias, description, role } = command.config;

                // Skip unloaded commands
                if (unloadedCmds.includes(name)) continue;

                // Role check to filter commands user has permission to see
                if (role > 0 && !message.isAdmin && !message.isModerator) continue;
                if (role > 1 && !message.isAdmin) continue;

                helpMessage += `Nama: ${name} (Alias: ${alias.join(", ")})\nDeskripsi: ${description}\n\n`;
            }

            api.sendMessage(helpMessage, message.threadID);
        } catch (error) {
            console.error(error);
            api.sendMessage("Terjadi kesalahan saat menampilkan bantuan.", message.threadID);
        }
    }
};
                      
