const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'local-users.json');

function ensureStore() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(dataFile)) {
        fs.writeFileSync(dataFile, JSON.stringify({ users: [] }, null, 2), 'utf8');
    }
}

function readStore() {
    ensureStore();
    const raw = fs.readFileSync(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.users || !Array.isArray(parsed.users)) {
        return { users: [] };
    }
    return parsed;
}

function writeStore(store) {
    ensureStore();
    fs.writeFileSync(dataFile, JSON.stringify(store, null, 2), 'utf8');
}

function toSafeUser(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
}

function findUserByEmail(email) {
    const store = readStore();
    return store.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
}

function findUserByUsername(username) {
    const store = readStore();
    return store.users.find((u) => u.username.toLowerCase() === String(username).toLowerCase()) || null;
}

function findUserById(id) {
    const store = readStore();
    return store.users.find((u) => String(u.id) === String(id)) || null;
}

function createUser(userData) {
    const store = readStore();
    const nextId = store.users.reduce((maxId, user) => Math.max(maxId, Number(user.id) || 0), 0) + 1;

    const user = {
        id: nextId,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name || null,
        phone: userData.phone || null,
        address: userData.address || null,
        user_type: userData.user_type || 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null
    };

    store.users.push(user);
    writeStore(store);
    return user;
}

function updateLastLogin(id) {
    const store = readStore();
    const user = store.users.find((u) => String(u.id) === String(id));
    if (!user) return null;
    user.last_login = new Date().toISOString();
    user.updated_at = new Date().toISOString();
    writeStore(store);
    return user;
}

module.exports = {
    toSafeUser,
    findUserByEmail,
    findUserByUsername,
    findUserById,
    createUser,
    updateLastLogin
};
