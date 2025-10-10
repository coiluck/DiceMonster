const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('appData', {
    getLang: () => ipcRenderer.invoke('get-lang'),
    getGameData: () => ipcRenderer.invoke('get-game-data'),
    saveGameData: (gameData) => ipcRenderer.invoke('save-game', gameData),
    deleteGameData: () => ipcRenderer.invoke('delete-game'),
    setLang: (lang) => ipcRenderer.invoke('set-lang', lang)
});