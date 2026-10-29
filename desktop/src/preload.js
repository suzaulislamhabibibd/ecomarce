'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Expose the settings API only to the bundled setup page, never to the website.
if (location.protocol === 'file:') {
    contextBridge.exposeInMainWorld('haatbazar', {
        getConfig: () => ipcRenderer.invoke('config:get'),
        testServer: (url) => ipcRenderer.invoke('server:test', url),
        saveServer: (url) => ipcRenderer.invoke('server:save', url),
    });
}
