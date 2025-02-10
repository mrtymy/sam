const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded.');

contextBridge.exposeInMainWorld('electronAPI', {
  launchSteam: (username, password) => {
    console.log('launchSteam function called');
    ipcRenderer.send('launch-steam', username, password);
  },
  killSteam: () => {
    console.log('killSteam function called');
    ipcRenderer.send('kill-steam');
  },
  checkSteamProcess: () => {
    ipcRenderer.send('check-steam-process');
  },
  checkSteamLoginChange: () => {
    ipcRenderer.send('watch-steam-login');
  }
});
