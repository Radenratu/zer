const login = require('facebook-chat-api');
const fs = require('fs');
const path = require('path');
const { addUser, addThread } = require('./data/AddData');

// Baca appstate dan config dari file
const appStatePath = path.join(__dirname, 'appstate.json');
let appState = {};
if (fs.existsSync(appStatePath)) {
    appState = JSON.parse(fs.readFileSync(appStatePath, 'utf8'));
}
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const prefix = config.prefix;
const userAgent = config.userAgent;
const adminIDs = config.adminID;
const modIDs = config.modID;
const unloadedCmds = config.unloadedCmds || [];

// Fungsi untuk memuat command dari folder plugins
function loadCommand(commandName) {
    const commandPath = path.join(__dirname, 'plugins', `${commandName}.js`);
    if (fs.existsSync(commandPath)) {
        return require(commandPath);
    } else {
        return null;
    }
}

// Login menggunakan cookies dan user agent
login({ appState: appState, logLevel: "silent" }, (err, api) => {
    if (err) return console.error("Login Error:", err);

    // Menyimpan appState baru setelah login
    fs.writeFileSync(appStatePath, JSON.stringify(api.getAppState(), null, 2));

    // Set options untuk mendengarkan pesan menggunakan MQTT
    api.setOptions({
        listenEvents: true,
        online: true,
        selfListen: false,
        updatePresence: false,
        mqttClient: true // Menggunakan MQTT untuk mendengarkan
    });

    // Mulai mendengarkan pesan
    api.listenMqtt((err, message) => {
        if (err) return console.error("Listen Error:", err);

        const { body, threadID, senderID } = message;

        // Mengabaikan pesan yang tidak ada isi
        if (!body) return;
        const senderID = message.senderID;
        const threadID = message.threadID;
        const body = message.body;

        // Tambah data user dan thread jika belum ada
        const userInfo = await api.getUserInfo(senderID);
        addUser(senderID, userInfo[senderID].name, userInfo[senderID].gender);
        addThread(threadID, message.threadName);

        // Role-based permission checks
        message.isAdmin = adminIDs.includes(senderID);
        message.isModerator = modIDs.includes(senderID);

        // Cek apakah pesan dimulai dengan prefix
        if (!body.startsWith(prefix)) return;

        // Ambil command dan argumen
        const args = body.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();

        // Muat command dari folder plugins
        const command = loadCommand(commandName);
        if (command) {
            const { cooldown, role } = command.config;

            // Periksa apakah pengguna memiliki izin untuk menjalankan command ini
            if (role > 0 && !message.isAdmin && !(role === 1 && message.isModerator)) {
                return api.sendMessage("Anda tidak memiliki izin untuk menjalankan perintah ini.", message.threadID);
            }

            // Periksa apakah command dalam status unload
            if (unloadedCmds.includes(`${commandName}.js`)) {
                return api.sendMessage(`Command ${commandName} saat ini tidak aktif.`, message.threadID);
            }

            // Jalankan command
            try {
                command.BotRun(api, message, args);
            } catch (error) {
                console.error(error);
                api.sendMessage("Terjadi kesalahan saat menjalankan perintah.", message.threadID);
            }
        } else {
            api.sendMessage(`Command ${commandName} tidak ditemukan. Gunakan /help untuk melihat daftar command.`, message.threadID);
        }
    });
});
