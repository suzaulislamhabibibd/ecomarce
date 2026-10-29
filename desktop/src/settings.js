'use strict';

const fs = require('node:fs');
const path = require('node:path');

const PRESETS = [
    { id: 'live', label: 'Live website', url: 'https://ecomarce-gray.vercel.app' },
    { id: 'local', label: 'This PC (Laragon / php artisan serve)', url: 'http://127.0.0.1:8000' },
];

/**
 * Turn user input into a server origin such as "https://shop.example.com".
 * Adds a scheme when missing (http for local addresses, https otherwise)
 * and drops any path. Returns null for anything that is not http(s).
 */
function normalizeServerUrl(input) {
    let value = String(input || '').trim();
    if (!value) return null;

    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
        const local = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(value);
        value = (local ? 'http://' : 'https://') + value;
    }

    let url;
    try {
        url = new URL(value);
    } catch {
        return null;
    }
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) return null;

    return url.origin;
}

function isSameOrigin(target, serverUrl) {
    try {
        return new URL(target).origin === new URL(serverUrl).origin;
    } catch {
        return false;
    }
}

/** Small JSON config stored in the app's user data folder. */
class Settings {
    constructor(dir) {
        this.file = path.join(dir, 'config.json');
        this.data = {};
        try {
            this.data = JSON.parse(fs.readFileSync(this.file, 'utf8')) || {};
        } catch {
            this.data = {};
        }
    }

    get serverUrl() {
        return normalizeServerUrl(this.data.serverUrl);
    }

    set serverUrl(value) {
        this.data.serverUrl = normalizeServerUrl(value);
        fs.mkdirSync(path.dirname(this.file), { recursive: true });
        fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
    }
}

module.exports = { PRESETS, Settings, isSameOrigin, normalizeServerUrl };
