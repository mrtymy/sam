const { contextBridge, ipcRenderer } = require('electron');

// Preload scriptinin çalışıp çalışmadığını kontrol etmek için log ekleyin
console.log('Preload script loaded.');

contextBridge.exposeInMainWorld('electronAPI', {
  launchSteam: (username, password) => {
    console.log('launchSteam function called'); // Bu log ile fonksiyonun çağrılıp çağrılmadığını kontrol edin
    ipcRenderer.send('launch-steam', username, password);
  },
  killSteam: () => {
    console.log('killSteam function called'); // killSteam fonksiyonunun çağrılıp çağrılmadığını kontrol edin
    ipcRenderer.send('kill-steam');
  }
});
