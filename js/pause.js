// pause.js
import { changeModal, showModal, closeModal } from './module/changeModal.js';

// escボタンを押したときの処理
document.addEventListener('keydown', (event) => {
  const modal = document.getElementById('modal-pause');
  const display = modal ? window.getComputedStyle(modal).display : 'none';
  if (event.key === 'Escape' && display === 'none') {
    try { showModal('pause', null); } catch (e) { console.error('showModal error', e); }
  } else if (event.key === 'Escape' && display !== 'none') {
    try { closeModal('pause'); } catch (e) { console.error('closeModal error', e); }
  }
}, { capture: true });

// 閉じる処理
document.getElementById('pause-resume-button').addEventListener('click', () => {
  closeModal('pause')
});
document.getElementById('pause-close-button-container').addEventListener('click', () => {
  closeModal('pause');
});

// Settings処理
document.getElementById('pause-settings-button').addEventListener('click', () => {
  closeModal('pause');
  showModal('settings', null);
});

import { globalGameState, resetGlobalState, setGlobalGameState } from './module/gameState.js';
import { initGame } from './game.js';
// Restart処理
document.getElementById('pause-restart-button').addEventListener('click', () => {
  closeModal('pause');
  resetGlobalState();
  changeModal('top', null, 500);
});
// Quit処理
document.getElementById('pause-quit-button').addEventListener('click', async () => {
  // データを保存はresultのすべての報酬を獲得したときに更新
  // ここでは何もしない
  // Topに遷移
  closeModal('pause');
  changeModal('top', null, 500);
  // continueボタンを表示
  const gameData = await window.appData.getGameData()
  if (gameData) {
    document.querySelector('.top-continue-button').style.display = 'flex';
    window.gameData = gameData;
  }
});