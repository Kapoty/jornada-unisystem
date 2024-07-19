const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld('electron', {
    'quit': () => ipcRenderer.send('quit'),
    'setIgnoreMouseEvents': (ignore, options) => ipcRenderer.send('set-ignore-mouse-events', ignore, options),
    'onMouseMove': (callback) => ipcRenderer.on('mousemove', (event) => callback(event)),
});