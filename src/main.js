const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

// Steam'in yüklü olduğu doğru yolu belirle
const steamPath = 'D:\\onlineoyunlar\\Steam\\steam.exe'; // Steam'in kurulu olduğu yol

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');
}

// Steam'i başlatmak için olay dinleyicisi
ipcMain.on('launch-steam', (event, username, password) => {
  const command = `"${steamPath}" -cafeapplaunch -noverifyfiles -login ${username} ${password}`;
  console.log(`Executing command: ${command}`);
  exec(command, (error, stdout, stderr) => {
      if (error) {
          console.error(`Error launching Steam: ${error.message}`);
          console.error(`Error stack trace: ${error.stack}`); // Hata yığını eklendi
          return;
      }
      if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
  });
});

ipcMain.on('kill-steam', () => {
  console.log('Killing steam.exe process');
  exec('taskkill /IM steam.exe /F', (error, stdout, stderr) => {
      if (error) {
          console.error(`Error killing steam.exe: ${error.message}`);
          return;
      }
      if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
