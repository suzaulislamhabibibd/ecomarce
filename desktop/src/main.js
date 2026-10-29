'use strict';

const path = require('node:path');
const { app, BrowserWindow, Menu, dialog, ipcMain, net, session, shell } = require('electron');
const { PRESETS, Settings, isSameOrigin, normalizeServerUrl } = require('./settings');

const SETUP_PAGE = path.join(__dirname, 'pages', 'setup.html');
let settings;
let win;

if (!app.requestSingleInstanceLock()) {
    app.quit();
}

function isSetupPage(url) {
    return url.startsWith('file:') && decodeURIComponent(new URL(url).pathname).replace(/\\/g, '/').endsWith('/pages/setup.html');
}

function showSetup(error) {
    const query = { server: settings.serverUrl || '' };
    if (error) query.error = error;
    win.loadFile(SETUP_PAGE, { query });
}

function openServer(pathname = '/') {
    if (!settings.serverUrl) return showSetup();
    win.loadURL(settings.serverUrl + pathname);
}

/** Check that a URL is a reachable HaatBazar server by calling its API. */
async function testServer(input) {
    const origin = normalizeServerUrl(input);
    if (!origin) return { ok: false, message: 'Enter a valid web address, e.g. https://ecomarce-gray.vercel.app' };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
        const res = await net.fetch(`${origin}/api/v1/home`, { headers: { Accept: 'application/json' }, signal: controller.signal });
        if (!res.ok) return { ok: false, origin, message: `The server answered with an error (HTTP ${res.status}).` };
        const data = await res.json().catch(() => null);
        if (!data || !Array.isArray(data.categories)) return { ok: false, origin, message: 'This address does not look like a HaatBazar server.' };
        return { ok: true, origin, message: `Connected to ${data.settings?.site_name || 'HaatBazar'}.` };
    } catch (e) {
        return { ok: false, origin, message: e.name === 'AbortError' ? 'The server did not answer in time.' : 'Cannot reach the server. Is it running, and is the address right?' };
    } finally {
        clearTimeout(timer);
    }
}

function registerIpc() {
    // Only the bundled setup page may change settings.
    const fromSetup = (event) => isSetupPage(event.senderFrame?.url || '');

    ipcMain.handle('config:get', (event) => (fromSetup(event) ? { serverUrl: settings.serverUrl, presets: PRESETS } : null));
    ipcMain.handle('server:test', (event, url) => (fromSetup(event) ? testServer(url) : null));
    ipcMain.handle('server:save', async (event, url) => {
        if (!fromSetup(event)) return null;
        const result = await testServer(url);
        if (result.ok) {
            settings.serverUrl = result.origin;
            buildMenu();
            openServer();
        }
        return result;
    });
}

function lockDownNavigation(contents) {
    const allowed = (url) => isSetupPage(url) || (settings.serverUrl && isSameOrigin(url, settings.serverUrl));
    const openOutside = (url) => {
        if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) shell.openExternal(url);
    };

    contents.on('will-navigate', (event, url) => {
        if (!allowed(url)) {
            event.preventDefault();
            openOutside(url);
        }
    });

    contents.setWindowOpenHandler(({ url }) => {
        if (settings.serverUrl && isSameOrigin(url, settings.serverUrl)) {
            contents.loadURL(url);
        } else {
            openOutside(url);
        }
        return { action: 'deny' };
    });

    contents.on('did-fail-load', (_event, code, description, url, isMainFrame) => {
        // -3 is an aborted navigation (e.g. a redirect), not a real failure.
        if (isMainFrame && code !== -3 && !isSetupPage(url)) {
            showSetup(`Could not open ${url} (${description}). Check your internet connection or the server address.`);
        }
    });
}

function buildMenu() {
    const go = (p) => () => openServer(p);
    const template = [
        {
            label: 'HaatBazar',
            submenu: [
                { label: 'Home', accelerator: 'CmdOrCtrl+H', click: go('/') },
                { label: 'Back', accelerator: 'Alt+Left', click: () => win.webContents.navigationHistory.canGoBack() && win.webContents.navigationHistory.goBack() },
                { label: 'Forward', accelerator: 'Alt+Right', click: () => win.webContents.navigationHistory.canGoForward() && win.webContents.navigationHistory.goForward() },
                { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => win.webContents.reload() },
                { type: 'separator' },
                { label: 'Server settings…', click: () => showSetup() },
                { type: 'separator' },
                { role: 'quit', label: 'Exit' },
            ],
        },
        {
            label: 'Panels',
            submenu: [
                { label: 'My orders', click: go('/account/orders') },
                { label: 'Seller center', click: go('/vendor') },
                { label: 'Affiliate center', click: go('/affiliate') },
                { label: 'Admin panel', click: go('/admin') },
            ],
        },
        {
            label: 'View',
            submenu: [
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { role: 'resetZoom' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
                ...(app.isPackaged ? [] : [{ role: 'toggleDevTools' }]),
            ],
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About HaatBazar',
                    click: () =>
                        dialog.showMessageBox(win, {
                            type: 'info',
                            title: 'About HaatBazar',
                            message: `HaatBazar ${app.getVersion()}`,
                            detail: `Multivendor marketplace desktop app.\nServer: ${settings.serverUrl || 'not set'}`,
                        }),
                },
            ],
        },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
    win = new BrowserWindow({
        width: 1280,
        height: 820,
        minWidth: 900,
        minHeight: 600,
        title: 'HaatBazar',
        backgroundColor: '#f8fafc',
        icon: path.join(__dirname, '..', 'build', 'icon.png'),
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            sandbox: true,
            nodeIntegration: false,
        },
    });
    win.once('ready-to-show', () => win.show());
    lockDownNavigation(win.webContents);
    openServer();
}

app.on('second-instance', () => {
    if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});

app.whenReady().then(() => {
    settings = new Settings(app.getPath('userData'));
    if (process.env.HAATBAZAR_SERVER) settings.serverUrl = process.env.HAATBAZAR_SERVER;

    // The site only needs the clipboard (for "Copy link"); deny everything else.
    session.defaultSession.setPermissionRequestHandler((contents, permission, callback, details) => {
        callback(permission === 'clipboard-sanitized-write' && settings.serverUrl && isSameOrigin(details.requestingUrl, settings.serverUrl));
    });

    registerIpc();
    buildMenu();
    createWindow();
});

app.on('window-all-closed', () => app.quit());
