const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            webSecurity: false 
        }
    });

    mainWindow.loadFile('index.html');
}

// Steam sürecini kontrol etme
ipcMain.on('check-steam-process', (event) => {
    exec('tasklist', (err, stdout, stderr) => {
        if (err) {
            console.error(`Error checking Steam process: ${err.message}`);
            event.reply('steam-process-status', false);
            return;
        }
        const steamRunning = stdout.toLowerCase().includes('steam.exe');
        event.reply('steam-process-status', steamRunning);
    });
});

// Steam login değişimini kontrol etme
ipcMain.on('watch-steam-login', (event) => {
    const steamPath = path.join('C:', 'Program Files (x86)', 'Steam', 'config', 'loginusers.vdf');
    
    fs.watchFile(steamPath, (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
            console.log('Steam loginuser değişti.');
            event.reply('steam-login-changed', true);
        }
    });
});
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('disable-site-isolation-trials');
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
