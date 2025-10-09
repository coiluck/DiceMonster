// endGame.js
import { globalGameState, resetGlobalState } from "./gameState.js";
import { changeModal } from "./changeModal.js";
import { initGame } from "../game.js";

export function setUpEndgame(isClear) {
  changeModal('endgame', null, 500, false);
  // statsの設定
  const statsData = [
    {
      label: '難易度',
      enLabel: 'Difficulty',
      value: globalGameState.difficulty
    },
    {
      label: isClear ? '撃破したボス' : '最終ラウンド',
      enLabel: isClear ? 'Defeated Boss' : 'Final Round',
      value: isClear ? globalGameState.forStats.bossName : globalGameState.round
    },
    {
      label: '総ターン数',
      enLabel: 'Total Turns',
      value: globalGameState.forStats.totalTurns
    },
    {
      label: '毎ターンの平均ダメージ',
      enLabel: 'Average Damage per Turn',
      value: (globalGameState.forStats.totalDamage / globalGameState.forStats.totalTurns).toFixed(1)
    },
    {
      label: '所持アイテム数',
      enLabel: 'Number of Items',
      value: globalGameState.player.items.length
    }
  ];
  let statsHTML = ''; 
  for (const stat of statsData) {
    const label = window.currentLang === 'en' ? stat.enLabel : stat.label;
    statsHTML += `
      <div class="endgame-stat-item">
        <span class="endgame-stat-label">${label}</span>
        <span class="endgame-stat-value">${stat.value}</span>
      </div>
    `;
  }
  document.querySelector('#modal-endgame .endgame-stats').innerHTML = statsHTML;
  // subtitleのデータ
  const enVictoryArray = ['A new dawn rises', 'Your name echoes through eternity', 'The darkness fades before your light', 'Fate kneels before your will', 'You have carved your legend into history', 'Silence falls… but this time, in peace'];
  const jaVictoryArray = ['新たな暁が訪れる', 'あなたの名は、永遠に刻まれた', '闇は退き、光が世界を包む', '運命さえ、あなたの意志に膝をつく', 'あなたの伝説は、今、歴史となった'];
  const enGameoverArray = ['Your legend ends here', 'You couldn’t reach your destiny', 'The world moves on without you', 'Only silence remains...','The darkness claims another soul'];
  const jaGameoverArray = ['光は途絶え、闇だけが残った', '運命はあなたを見放した', 'あなたの物語は、ここで途切れた', '希望は、手のひらから零れ落ちた', 'その手は、もう何も掴めない', '足跡は風にさらわれた'];
  // スタイルの設定
  document.querySelectorAll('#modal-endgame .clear, #modal-endgame .gameover').forEach(element => {
    element.classList.remove('clear', 'gameover');
  });
  if (isClear) {
    document.querySelector('#modal-endgame .endgame-title').textContent = 'Game Clear!'
    document.querySelector('#modal-endgame .endgame-title').classList.add('clear');
    document.querySelector('#modal-endgame .endgame-subtitle').textContent = window.currentLang === 'en' ? enVictoryArray[Math.floor(Math.random() * enVictoryArray.length)] : jaVictoryArray[Math.floor(Math.random() * jaVictoryArray.length)]
    document.querySelector('#modal-endgame .endgame-subtitle').classList.add('clear');
    document.querySelector('#modal-endgame .endgame-stats').classList.add('clear');
    document.querySelectorAll('#modal-endgame .endgame-stat-value').forEach(element => element.classList.add('clear'));
  } else {
    document.querySelector('#modal-endgame .endgame-title').textContent = 'Game Over!'
    document.querySelector('#modal-endgame .endgame-title').classList.add('gameover');
    document.querySelector('#modal-endgame .endgame-subtitle').textContent = window.currentLang === 'en' ? enGameoverArray[Math.floor(Math.random() * enGameoverArray.length)] : jaGameoverArray[Math.floor(Math.random() * jaGameoverArray.length)]
    document.querySelector('#modal-endgame .endgame-subtitle').classList.add('gameover');
    document.querySelector('#modal-endgame .endgame-stats').classList.add('gameover');
    document.querySelectorAll('#modal-endgame .endgame-stat-value').forEach(element => element.classList.add('gameover'));
  }
}

import { playSound } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
  // ボタンの設定
  document.getElementById('endgame-restart-button').addEventListener('click', () => {
    playSound('metallic');
    const difficulty = globalGameState.difficulty;
    resetGlobalState();
    globalGameState.difficulty = difficulty;
    initGame();
    changeModal('game', null, 500, true);
  });
  document.getElementById('endgame-main-menu-button').addEventListener('click', () => {
    playSound('metallic');
    changeModal('top', null, 500);
  })
});