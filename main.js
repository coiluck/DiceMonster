const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')

app.on('ready', () => {
    Menu.setApplicationMenu(null);
    const win = new BrowserWindow({
        width: 1200, 
        height: 675,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    win.loadFile(
        path.join(__dirname, "index.html")
    )
})

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit()
    }
})

// データ保存設定
const Store = require('electron-store');

const store = new Store({
  schema: {
    'lang': {
      type: 'string',
      enum: ['en', 'ja'],
      default: 'ja'
    },
    'gameData': {
      type: ['object', 'null'],
      default: null
    }
  }
});

// 言語設定
function getLang() {
  return store.get('lang', 'ja');
}
function setLang(lang) {
  try {
    store.set('lang', lang);
    return true;
  } catch (e) {
    console.error('【メインプロセス】言語設定の保存に失敗:', e.message);
    return false;
  }
}

// ゲームデータ
function saveGameData(gameState) {
  try {
    store.set('gameData', gameState);
    console.log(`【メインプロセス】ゲームデータを保存完了`);
    return true;
  } catch (e) {
    console.error(`【メインプロセス】ゲームデータの保存に失敗:`, e.message);
    return false;
  }
}
function getGameData() {
  return store.get('gameData');
}
function deleteGameData() {
  store.delete('gameData');
  console.log(`【メインプロセス】ゲームデータを削除`);
}

// ipcで呼び出し
ipcMain.handle('get-lang', async () => {
  const lang = getLang();
  console.log(`【メインプロセス】言語を取得: ${lang}`);
  return lang;
});
ipcMain.handle('set-lang', async (event, lang) => {
  console.log(`【メインプロセス】言語を設定: ${lang}`);
  return setLang(lang);
});
ipcMain.handle('load-game', async (event) => {
  console.log(`【メインプロセス】ゲームデータを読み込み`);
  return getGameData();
});
ipcMain.handle('save-game', async (event, gameState) => {
  console.log(`【メインプロセス】ゲームデータを保存`);
  return saveGameData(gameState);
});
ipcMain.handle('delete-game', async (event) => {
  console.log(`【メインプロセス】ゲームデータを削除`);
  deleteGameData();
  return true;
});
ipcMain.handle('get-game-data', async () => {
  console.log(`【メインプロセス】ゲームデータを取得`);
  return getGameData();
});

module.exports = {
  getLang,
  setLang,
  saveGameData,
  getGameData,
  deleteGameData
};