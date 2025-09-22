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

async function setUpEnemy(round) {
  // 各ラウンドの敵の設定
  
}

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

import { message } from './module/message.js';

// フェーズを切り替える関数
function setPhase(phase) {
  document.querySelectorAll('.button-group').forEach(group => {
    if (group.dataset.phase == phase) {
      group.classList.add('active'); // 表示
    } else {
      group.classList.remove('active'); // 非表示
    }
  });
}
document.getElementById('dice-roll-button').addEventListener('click', () => {
  rollDice();
  setPhase(2);
});
document.getElementById('dice-reroll-button').addEventListener('click', () => {
  if (globalGameState.player.rerollCount === 0) {
    message('warning', 'リロール回数がありません', 3000);
    return;
  }
  rollDice();
  globalGameState.player.rerollCount--;
  document.querySelector('#dice-reroll-button').textContent = `リロール（残り${globalGameState.player.rerollCount}回）`;
  setPhase(2); 
});
document.getElementById('dice-confirm-button').addEventListener('click', () => {
  setPhase(3);
});
document.getElementById('dice-attack-button').addEventListener('click', () => {
  // 以下のはsetUpNextTurnで行うべき
  // ここでは攻撃対象の選択を行う
  globalGameState.player.rerollCount = 2;
  document.querySelector('#dice-reroll-button').textContent = `リロール（残り${globalGameState.player.rerollCount}回）`;
  document.querySelectorAll('.dice').forEach(dice => {
    dice.classList.remove('hold');
    dice.removeEventListener('click', toggleHold);
    dice.textContent = '？';
  });
  document.querySelector('#dice-hand-info-title').textContent = `現在の役: ---`;
  document.querySelector('#dice-hand-info-effect-value').textContent = '---';
  setPhase(1);
});
setPhase(1); // 初期状態

import { judgeHand } from './module/judgeHand.js';

function rollDice() {
  const dicesToRoll = document.querySelectorAll('.dice:not(.hold)');
  if (dicesToRoll.length === 0) {
    return; // すべて`.hold`のときとか
  }
  // ランダムな整数を生成
  const getRandomNumber = () => Math.floor(Math.random() * 6) + 1;
  // アニメーションを開始
  const intervalId = setInterval(() => {
    dicesToRoll.forEach(dice => {
      dice.textContent = getRandomNumber();
    });
  }, 25);
  //最終結果を確定
  setTimeout(() => {
    clearInterval(intervalId);
    dicesToRoll.forEach(dice => {
      dice.textContent = getRandomNumber();
      dice.addEventListener('click', toggleHold);
    });
    const hand = judgeHand();
    console.log(hand);
    document.querySelector('#dice-hand-info-title').textContent = `現在の役: ${hand.handName}`;
    document.querySelector('#dice-hand-info-effect-value').textContent = hand.text;
  }, 1000);
}

function toggleHold(event) {
  event.currentTarget.classList.toggle('hold');
}
