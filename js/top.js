// top.js
import { isContinueGame } from './module/save.js';

document.addEventListener('load', () => {
  // 前回のデータがあるなら「続きから」を表示
  const isContinue = isContinueGame();
  if (isContinue) {
    console.log('前回のデータがあります');
    if (isContinue.isGameStart || isContinue.round === 1) {
      document.querySelector('.top-continue-game-button').style.display = 'none';
    } else {
      document.querySelector('.top-continue-game-button').style.display = 'flex';
    }
  } else {
    console.log('前回のデータがありません');
    document.querySelector('.top-continue-game-button').style.display = 'none';
  }
});

import { changeModal } from './module/changeModal.js';

document.querySelector('.top-continue-button').addEventListener('click', () => {
  changeModal('game', null, 500, true);
});
document.querySelector('.top-new-button').addEventListener('click', () => {
  changeModal('game', null, 500, true);
});
document.querySelector('.top-rules-button').addEventListener('click', () => {
  changeModal('rules', null, 500, true);
});

document.querySelector('.settings-icon').addEventListener('click', () => {
  changeModal('settings', null, 500, true);
});