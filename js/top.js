// top.js
import { changeLanguage } from './settings.js';
import { playerAnimInTop } from './module/characterAnimation.js';
import { setGlobalGameState } from './module/gameState.js';
import { initGame } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  playerAnimInTop.start();
  // 描画前に実行
  Promise.all([
    window.appData.getLang(),
    window.appData.getGameData()
  ]).then(([lang, gameData]) => {
    // この時点で必要なデータ
    console.log('言語:', lang);
    console.log('ゲームデータ:', gameData);
    // ゲームデータ
    if (gameData) {
      window.gameData = gameData;
      document.querySelector('.top-continue-button').style.display = 'flex';
      document.querySelector('.top-continue-button').addEventListener('click', () => {
        setGlobalGameState(window.gameData);
        initGame();
        changeModal('game', null, 500, true);
        playSound('metallic');
      });
    } else {
      document.querySelector('.top-continue-button').style.display = 'none';
      document.querySelector('.top-continue-button').addEventListener('click', () => {
        setGlobalGameState(window.gameData);
        initGame();
        changeModal('game', null, 500, true);
        playSound('metallic');
      });
    }
    // 言語設定
    if (lang === 'ja') {
      window.currentLang = 'ja';
      document.getElementById('btn-ja').classList.add('active');
      document.getElementById('btn-en').classList.remove('active');
      changeLanguage();
    } else {
      window.currentLang = 'en';
      document.getElementById('btn-en').classList.add('active');
      document.getElementById('btn-ja').classList.remove('active');
      changeLanguage();
    }
    changeModal('top', null, 500, true);
  }).catch(err => {
    console.error('初期データ取得失敗:', err);
  });
});

import { changeModal } from './module/changeModal.js';
import { playSound } from './module/audio.js';

/* これは読み込み時に行う
document.querySelector('.top-continue-button').addEventListener('click', () => {
  changeModal('game', null, 500, true);
  playSound('metallic');
}); */
document.querySelector('.top-new-button').addEventListener('click', () => {
  // initGameはdifficultly.jsで行う
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
  button.addEventListener('click', buttonSound);
});
function buttonSound() {
  document.querySelectorAll('button').forEach((button) => {
    button.removeEventListener('click', buttonSound);
  });
  bgm.play('assets/audio/theme1.mp3');
}