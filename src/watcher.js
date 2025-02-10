const fs = require('fs');
const path = require('path');

// Steam'in yüklü olduğu dizin ve loginusers.vdf dosyasının yolu
const steamDir = 'D:\\onlineoyunlar\\Steam';
const loginUsersFile = path.join(steamDir, 'config', 'loginusers.vdf');

function watchSteamAccounts(callback) {
  if (!fs.existsSync(loginUsersFile)) {
    console.error('loginusers.vdf dosyası bulunamadı.');
    return;
  }

  fs.watchFile(loginUsersFile, (curr, prev) => {
    console.log('loginusers.vdf dosyasında değişiklik algılandı.');
    if (typeof callback === 'function') {
      callback();
    }
  });
}

module.exports = { watchSteamAccounts };
