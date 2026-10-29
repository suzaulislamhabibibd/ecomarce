'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Settings, isSameOrigin, normalizeServerUrl } = require('../src/settings');

test('normalizeServerUrl adds schemes and keeps only the origin', () => {
    assert.strictEqual(normalizeServerUrl('ecomarce-gray.vercel.app'), 'https://ecomarce-gray.vercel.app');
    assert.strictEqual(normalizeServerUrl('https://shop.example.com/products?q=1'), 'https://shop.example.com');
    assert.strictEqual(normalizeServerUrl(' 127.0.0.1:8000 '), 'http://127.0.0.1:8000');
    assert.strictEqual(normalizeServerUrl('localhost:8000/'), 'http://localhost:8000');
    assert.strictEqual(normalizeServerUrl('192.168.0.10:8000'), 'http://192.168.0.10:8000');
});

test('normalizeServerUrl rejects non-web addresses', () => {
    for (const bad of ['', '   ', 'javascript:alert(1)', 'file:///C:/x', 'ftp://example.com', 'http://']) {
        assert.strictEqual(normalizeServerUrl(bad), null, bad);
    }
});

test('isSameOrigin compares scheme, host and port', () => {
    assert.ok(isSameOrigin('https://shop.test/product/x?ref=A', 'https://shop.test'));
    assert.ok(!isSameOrigin('https://evil.test/', 'https://shop.test'));
    assert.ok(!isSameOrigin('http://shop.test/', 'https://shop.test'));
    assert.ok(!isSameOrigin('not a url', 'https://shop.test'));
});

test('Settings persists the server url', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hb-settings-'));
    const first = new Settings(dir);
    assert.strictEqual(first.serverUrl, null);
    first.serverUrl = 'shop.example.com/admin';
    assert.strictEqual(new Settings(dir).serverUrl, 'https://shop.example.com');
});
