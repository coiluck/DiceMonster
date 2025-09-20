// game.js
document.querySelector('.top-continue-button').addEventListener('click', () => {
  initGame();
});
document.querySelector('.top-new-button').addEventListener('click', () => {
  initGame();
});

import { globalGameState } from './module/gameState.js';
import { addTooltipEvents } from './module/addToolTip.js';

function initGame() {
  setUpEnemy(globalGameState.round);
  setUpPlayer();
  setUpItems();
  setUpDice();
}

async function setUpEnemy(round) { }

import { skillsData } from './module/skills.js';

function setUpPlayer() {
  // アイテムの効果はこの前に書かないといけない
  document.querySelector('#player-bar').style.width = `${globalGameState.player.hp / globalGameState.player.maxHp * 100}%`;
  document.querySelector('#player-hp').textContent = globalGameState.player.hp;
  document.querySelector('#player-max-hp').textContent = globalGameState.player.maxHp;
  document.querySelector('#skill-point').textContent = globalGameState.player.skillsPoint;
  // buffの設定
  document.querySelector('#player-buff-container .buff-shield .buff-number').textContent = globalGameState.player.shield;
  document.querySelector('#player-buff-container .buff-shield').style.display = globalGameState.player.shield === 0 ? 'none' : 'block';
  document.querySelector('#player-buff-container .buff-attack .buff-number').textContent = globalGameState.player.attack;
  document.querySelector('#player-buff-container .buff-attack').style.display = globalGameState.player.attack === 0 ? 'none' : 'block';
  document.querySelector('#player-buff-container .buff-reduction .buff-number').textContent = globalGameState.player.damageReduction;
  document.querySelector('#player-buff-container .buff-reduction').style.display = globalGameState.player.damageReduction === 0 ? 'none' : 'block';
  // skillの設定
  document.querySelector('.skills').innerHTML = '';
  for (const skill of globalGameState.player.skills) {
    const skillBtn = document.createElement('button');
    skillBtn.className = 'skill-btn';
    skillBtn.textContent = skillsData[skill].name;
    skillBtn.dataset.skill = skill;
    addTooltipEvents(skillBtn, skillsData[skill].description);
    skillBtn.addEventListener('click', () => {
      // スキルの使用処理
    });
    document.querySelector('.skills').appendChild(skillBtn);
  }
}

function setUpItems() {}

function setUpDice() {
  document.querySelector('.dice-area').innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const dice = document.createElement('div');
    dice.className = 'dice';
    dice.textContent = '？';
    document.querySelector('.dice-area').appendChild(dice);
  }
}

