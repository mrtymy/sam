const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const steamDir = 'D:\\onlineoyunlar\\Steam';
const loginUsersFile = path.join(steamDir, 'config', 'loginusers.vdf');

function watchSteamAccounts(username, callback) {
    if (!fs.existsSync(loginUsersFile)) {
        console.error('loginusers.vdf dosyası bulunamadı.');
        return;
    }

    // Dosya izleyiciyi ayarlıyoruz
    fs.watchFile(loginUsersFile, (curr, prev) => {
        console.log('loginusers.vdf dosyasında değişiklik algılandı.');
        if (typeof callback === 'function') {
            callback();
        }

        // Steam hesap çıkışı tespit edildiğinde
        exec('tasklist', (err, stdout, stderr) => {
            if (stdout.indexOf('steam.exe') === -1) {
                // Eğer steam.exe çalışmıyorsa hesap çıkışı yapılmış demektir
                console.log('Steam kapandı, hesap çıkış yapıldı.');

                // Hesap durumunu boşta olarak güncellemek için handleSteamLogout'u tetikle
                handleSteamLogout(username);
            }
        });
    });
}

module.exports = { watchSteamAccounts };
