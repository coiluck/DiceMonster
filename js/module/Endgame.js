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
      value: isClear ? globalGameState.bossName : globalGameState.round
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
  // スタイルの設定
  document.querySelectorAll('#modal-endgame .clear, #modal-endgame .gameover').forEach(element => {
    element.classList.remove('clear', 'gameover');
  });
  if (isClear) {
    document.querySelector('#modal-endgame .endgame-title').textContent = 'Game Clear!'
    document.querySelector('#modal-endgame .endgame-title').classList.add('clear');
    document.querySelector('#modal-endgame .endgame-subtitle').textContent = 'aaaaaaa'
    document.querySelector('#modal-endgame .endgame-subtitle').classList.add('clear');
    document.querySelector('#modal-endgame .endgame-stats').classList.add('clear');
    document.querySelectorAll('#modal-endgame .endgame-stat-value').forEach(element => element.classList.add('clear'));
  } else {
    document.querySelector('#modal-endgame .endgame-title').textContent = 'Game Over!'
    document.querySelector('#modal-endgame .endgame-title').classList.add('gameover');
    document.querySelector('#modal-endgame .endgame-subtitle').textContent = 'bbbbbbbbbb'
    document.querySelector('#modal-endgame .endgame-subtitle').classList.add('gameover');
    document.querySelector('#modal-endgame .endgame-stats').classList.add('gameover');
    document.querySelectorAll('#modal-endgame .endgame-stat-value').forEach(element => element.classList.add('gameover'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // ボタンの設定
  document.getElementById('endgame-restart-button').addEventListener('click', () => {
    const difficulty = globalGameState.difficulty;
    resetGlobalState();
    globalGameState.difficulty = difficulty;
    initGame();
    changeModal('game', null, 500, true);
  });
  document.getElementById('endgame-main-menu-button').addEventListener('click', () => {
    changeModal('top', null, 500);
  })
});