const { contextBridge, ipcRenderer, exec, fs } = require('electron');
const path = require('path');

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
  },
  checkSteamProcess: (callback) => {
    exec('tasklist', (err, stdout, stderr) => {
      if (err) {
        console.error(`Error checking Steam process: ${err.message}`);
        callback(false);
        return;
      }
      // Eğer steam.exe tasklist'te varsa, çalışıyor demektir
      const steamRunning = stdout.toLowerCase().includes('steam.exe');
      callback(steamRunning); // Steam çalışıyorsa true döner, çalışmıyorsa false
    });
  },
  checkSteamLoginChange: (callback) => {
    const steamPath = path.join('C:', 'Program Files (x86)', 'Steam', 'config', 'loginusers.vdf');
    
    // loginusers.vdf dosyasını izleyerek kullanıcı değişikliklerini takip et
    fs.watchFile(steamPath, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        console.log('Steam loginuser değişti.');
        callback(true); // Kullanıcı değişmişse true döner
      }
    });
  }
});
