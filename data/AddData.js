const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, 'data.json');

// Membaca atau membuat file data.json
function readDataFile() {
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify({ users: {}, threads: {} }, null, 2));
    }
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

// Menyimpan data ke file
function saveDataFile(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Menambahkan user baru ke data.json
function addUser(userID, name, gender) {
    const data = readDataFile();
    if (!data.users[userID]) {
        data.users[userID] = {
            name: name,
            uid: userID,
            gender: gender,
            exp: 0,
            balance: 1 // Set initial balance to $1
        };
        saveDataFile(data);
    }
}

// Menambahkan thread baru ke data.json
function addThread(threadID, threadName) {
    const data = readDataFile();
    if (!data.threads[threadID]) {
        data.threads[threadID] = {
            threadName: threadName,
            threadID: threadID
        };
        saveDataFile(data);
    }
}

module.exports = { addUser, addThread };
