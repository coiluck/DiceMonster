// top.js
import { isContinueGame } from './module/save.js';
import { playerAnimInTop } from './module/characterAnimation.js';

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
document.addEventListener('DOMContentLoaded', () => {
  playerAnimInTop.start();
});

import { changeModal } from './module/changeModal.js';
import { playSound } from './module/audio.js';

document.querySelector('.top-continue-button').addEventListener('click', () => {
  changeModal('game', null, 500, true);
  playSound('metallic');
});
document.querySelector('.top-new-button').addEventListener('click', () => {
  changeModal('difficulty', null, 500, true);
  playSound('button');
});
document.querySelector('.top-rules-button').addEventListener('click', () => {
  changeModal('rules', '.rules-section', 500, true);
  playSound('button');
});

document.querySelector('.settings-icon').addEventListener('click', () => {
  changeModal('settings', null, 500, true);
  playSound('button');
});

document.getElementById('rules-close-button').addEventListener('click', () => {
  changeModal('top', null, 500, true);
})

import { bgm } from './module/audio.js';

document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', () => {
    bgm.play('assets/audio/theme1.mp3');
  });
});