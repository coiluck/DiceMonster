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
  chooseEnemy(globalGameState.round, globalGameState.difficulty);
  setUpPlayer();
  setUpItems();
  setUpDice();
}

let enemyData;
async function getEnemyData() {
  if (!enemyData) {
    const response = await fetch('enemy.json');
    enemyData = await response.json();
  }
  return enemyData;
}

async function chooseEnemy(round, difficulty) {
  // 各ラウンドの敵の設定
  let earlyStageStart;
  let midStageStart;
  let lateStageStart;
  let maxEnemyLimit;
  if (difficulty === 'easy') {
    earlyStageStart = 1;
    midStageStart = 4;
    lateStageStart = 10;
    maxEnemyLimit = 3;
  } else if (difficulty === 'normal') {
    earlyStageStart = 1;
    midStageStart = 4;
    lateStageStart = 8;
    maxEnemyLimit = 4;
  } else if (difficulty === 'hard') {
    earlyStageStart = 1;
    midStageStart = 3;
    lateStageStart = 7;
    maxEnemyLimit = 5;
  }
  const enemyData = await getEnemyData();
  let enemyIds = [];
  // earlyStage -> ランク3の敵を1体
  if (round >= earlyStageStart && round < midStageStart) {
    const newEnemies = enemyData
      .filter(enemy => enemy.rank === 3)
      .filter(enemy => !globalGameState.easyStageEnemy.some(easyEnemy => easyEnemy.id === enemy.id));
    const randomIndex = Math.floor(Math.random() * newEnemies.length);
    const selectedEnemy = newEnemies[randomIndex];
    // selectedEnemyが存在する場合のみIDを配列に追加
    if (selectedEnemy) {
        enemyIds = [selectedEnemy.id];
    }
  // midStage -> ランク3～6の敵を (maxEnemyLimit - 1) 体
  } else if (round >= midStageStart && round < lateStageStart) {
    const midStageEnemies = enemyData.filter(enemy => enemy.rank >= 3 && enemy.rank <= 6);
    let selectedEnemies;
    if (midStageEnemies.length < maxEnemyLimit - 1) {
      selectedEnemies = midStageEnemies;
      console.warn("敵の候補が足りないため、存在する全ての候補を選びました。");
    } else {
      do {
        selectedEnemies = [...midStageEnemies]
          .sort(() => Math.random() - 0.5)
          .slice(0, maxEnemyLimit - 1);
      } while (
        selectedEnemies.length > 0 &&
        selectedEnemies.every(enemy => enemy.rank === 6)
      );
    }
    // 選ばれた敵オブジェクトの配列からIDのみを抽出して配列を生成
    enemyIds = selectedEnemies.map(enemy => enemy.id);
  // lateStage -> ランク5～8の敵を maxEnemyLimit 体
  } else if (round >= lateStageStart && round !== 15) {
    const lateStageEnemies = enemyData.filter(enemy => enemy.rank >= 5 && enemy.rank <= 8);
    let selectedEnemies;
    if (lateStageEnemies.length < maxEnemyLimit) {
      selectedEnemies = lateStageEnemies;
      console.warn("敵の候補が足りないため、存在する全ての候補を選びました。");
    } else {
      do {
        selectedEnemies = [...lateStageEnemies]
          .sort(() => Math.random() - 0.5)
          .slice(0, maxEnemyLimit);
      } while (
        selectedEnemies.length > 0 &&
        selectedEnemies.every(enemy => enemy.rank === 8)
      );
    }
    // 選ばれた敵オブジェクトの配列からIDのみを抽出して配列を生成
    enemyIds = selectedEnemies.map(enemy => enemy.id);
  // bossStage -> ボスを1体
  } else {
    const randomId = Math.random() < 0.5 ? 12 : 13;
    const selectedBoss = enemyData.find(enemy => enemy.id === randomId);
    // selectedBossが存在する場合のみIDを配列に追加
    if (selectedBoss) {
        enemyIds = [selectedBoss.id];
    }
  }
  // 最終的に選ばれた敵
  console.log("敵のID配列:", enemyIds);
  setUpEnemy(enemyIds);
}
function setUpEnemy(enemyIds) {
  document.getElementById('enemy-container').innerHTML = '';
  globalGameState.enemies = {};
  let enemyUniqueIdCount = 0;
  for (const enemyId of enemyIds) {
    const enemy = enemyData.find(e => e.id === enemyId);
    if (!enemy) {
      console.error(`ID: ${enemyId} の敵データが見つかりません。`);
      continue;
    }
    // globalGameStateに入れる
    enemyUniqueIdCount++
    globalGameState.enemies[enemyUniqueIdCount] = {
      id: enemy.id,
      hp: enemy.hp,
      attack: enemy.attack,
      attackInThisTurn: 0,
    };
    // 要素をDOMに作成
    const enemyCard = document.createElement('div');
    enemyCard.className = 'card';
    if (enemy.isBoss) {
      enemyCard.classList.add('boss');
    } else {
      enemyCard.classList.add('enemy');
    }
    enemyCard.dataset.enemyId = enemy.id;
    enemyCard.dataset.uniqueId = enemyUniqueIdCount;
    enemyCard.dataset.enemyHp = enemy.hp;
    enemyCard.innerHTML = `
      <p class="enemy-attack">${enemy.attack}</p>
      <p class="enemy-name">${enemy.name}</p>
      <img src="./assets/images/enemy/${enemy.image}">
      <p class="enemy-hp">HP: ${enemy.hp}</p>
    `;
    document.getElementById('enemy-container').appendChild(enemyCard);
  }
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
  document.querySelectorAll('.card.enemy').forEach(enemy => {
    const hp = Number(enemy.dataset.enemyHp);
    if (hp > 0) {
      enemy.classList.add('target');
      enemy.addEventListener('click', decideAttackTarget);
    }
  });
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
    console.log(`役: ${hand.handName}`);
    document.querySelector('#dice-hand-info-title').textContent = `現在の役: ${hand.handName}`;
    document.querySelector('#dice-hand-info-effect-value').textContent = hand.text;
  }, 1000);
}

function toggleHold(event) {
  event.currentTarget.classList.toggle('hold');
}

import { executeHand, enemyAttack } from './module/damage.js';

function decideAttackTarget(event) {
  processTurn(event.currentTarget);
}
async function processTurn(target) {
  // すべてのtargetとイベントリスナーを解除
  document.querySelectorAll('.card.enemy').forEach(card => {
    card.classList.remove('target');
    card.removeEventListener('click', decideAttackTarget);
  });
  // ダメージを与える
  const hand = judgeHand();
  const diceElements = document.querySelectorAll('.dice');
  const dices = Array.from(diceElements).map(el => parseInt(el.textContent, 10));
  await executeHand(target, hand, dices);
  // skillpoint
  globalGameState.player.skillsPoint += hand.skillpoint;
  document.getElementById('skill-point').textContent = globalGameState.player.skillsPoint;
  // 敵の攻撃
  await enemyAttack();
  // 次のターンの設定
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
  for (const enemyId in globalGameState.enemies) {
    if (globalGameState.enemies[enemyId].hp > 0) {
      globalGameState.enemies[enemyId].attackInThisTurn = 0;
      const targetEnemy = document.querySelector(`.card[data-unique-id="${enemyId}"]`);
      if (!targetEnemy) {
        console.warn('対象がありません');
        return;
      };
      // 攻撃力の合計値を表示
      const totalAttack =
        Math.max(0, globalGameState.enemies[enemyId].attack + globalGameState.enemies[enemyId].attackInThisTurn);
      targetEnemy.querySelector('.enemy-attack').textContent = `${totalAttack}`;
    }
  }
};