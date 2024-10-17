module.exports = {
    config: {
        name: "echo",
        alias: ["say"],
        version: "1.0.0",
        author: "Edinst",
        cooldown: 5, // Detik
        role: 0, // Role untuk user biasa
        description: "Mengirim ulang pesan yang diberikan.",
        category: "General",
        guide: "/echo <pesan>"
    },

    BotRun: async function(api, message, args) {
        try {
            const reply = args.join(" ");
            api.sendMessage(reply, message.threadID);
        } catch (error) {
            console.error(error);
            api.sendMessage("Terjadi kesalahan dalam menjalankan perintah.", message.threadID);
        }
    }
};
