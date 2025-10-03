// game.js
document.querySelector('.top-continue-button').addEventListener('click', () => {
  initGame();
});
document.querySelector('.top-new-button').addEventListener('click', () => {
  initGame();
});

import { globalGameState, setGlobalGameState } from './module/gameState.js';
import { addTooltipEvents } from './module/addToolTip.js';

let isProcessing;

export function initGame() {
  chooseEnemy(globalGameState.round, globalGameState.difficulty);
  setUpPlayer();
  setUpItems();
  setUpDice();
  isProcessing = false;
  globalGameState.forStats.totalTurns++;
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
      globalGameState.forStats.bossName = selectedBoss.name;
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
  // アイテムの効果を反映
  let damageByItem = 0;
  if (globalGameState.player.items.includes(4)) {
    damageByItem += globalGameState.player.items.filter(n => n === 4).length;
  }
  if (globalGameState.player.items.includes(5)) {
    damageByItem += globalGameState.player.items.filter(n => n === 5).length * 5;
  }
  for (const enemyId in globalGameState.enemies) {
    if (globalGameState.enemies[enemyId].hp > 0) {
      damage(enemyId, damageByItem, true);
    }
  }
}

import { skillsData, useSkill } from './module/skills.js';
import { renderBuff } from './module/buff.js';
import { damage } from './module/damage.js';
import { playerAnimInGame } from './module/characterAnimation.js';

function setUpPlayer() {
  // アイテムの効果はこの前に書かないといけない
  document.querySelector('#player-bar').style.width = `${globalGameState.player.hp / globalGameState.player.maxHp * 100}%`;
  document.querySelector('#player-hp').textContent = globalGameState.player.hp;
  document.querySelector('#player-max-hp').textContent = globalGameState.player.maxHp;
  document.querySelector('#skill-point').textContent = globalGameState.player.skillsPoint;
  // buffの設定
  globalGameState.player.shield = 0;
  globalGameState.player.damageReduction = 0;
  globalGameState.player.attack = 0;
  globalGameState.player.reduceSkillPoint = 0;
  globalGameState.player.maxSkillPoint = 10;
  globalGameState.player.isAllAttack = false;
  // globalGameState.player.skillsPoint = 0; <- これ引き継いだほうが面白いのでは
  // アイテムの効果を反映
  for (const id of globalGameState.player.items) {
    if (id === 1) {
      globalGameState.player.attack++;
    } else if (id === 2) {
      globalGameState.player.attack += 2;
    } else if (id === 3) {
      globalGameState.player.skillsPoint++;
    } else if (id === 6) { // 4と5は敵のHP
      globalGameState.player.skillsPoint += 2;
    } else if (id === 7) {
      globalGameState.player.hp = Math.min(globalGameState.player.hp + 3, globalGameState.player.maxHp);
      document.getElementById('player-hp').textContent = globalGameState.player.hp;
      document.querySelector('#player-bar').style.width = `${globalGameState.player.hp / globalGameState.player.maxHp * 100}%`;
    } else if (id === 8) {
      globalGameState.player.shield += 3;
    } else if (id === 12) { // 9, 10, 11は役の強化系
      globalGameState.player.damageReduction++;
    } else if (id === 13) {
      globalGameState.player.reduceSkillPoint++;
    } else if (id === 14) {
      globalGameState.player.attack += 3; // shield prohibit
    } else if (id === 15) {
      globalGameState.player.attack += 3; // all turn HP damage
      // HP damageは下で反映
    } else if (id === 16) {
      globalGameState.player.maxSkillPoint += 3
    }
  }
  // アイテムが反映された後に設定
  globalGameState.player.skillsPoint = Math.min(globalGameState.player.skillsPoint, globalGameState.player.maxSkillPoint);
  if (globalGameState.player.items.includes(14)) {
    globalGameState.player.shield = 0;
  }
  if (globalGameState.player.items.includes(15)) {
    const damage = globalGameState.player.items.filter(n => n === 15).length;
    damage('player', 2 * damage);
  }
  console.log(globalGameState.player);
  // 表示を更新
  renderBuff();
  document.getElementById('skill-point').textContent = globalGameState.player.skillsPoint + (globalGameState.player.skillsPoint === globalGameState.player.maxSkillPoint ? '(最大)' : '')
  document.querySelector('.skills').innerHTML = '';
  // skillの設定
  for (const skill of globalGameState.player.skills) {
    const skillBtn = document.createElement('button');
    skillBtn.className = 'skill-btn';
    skillBtn.textContent = skillsData[skill].name;
    skillBtn.dataset.skill = skill;
    addTooltipEvents(skillBtn, `${skillsData[skill].description} 消費ポイント: ${skillsData[skill].cost - globalGameState.player.reduceSkillPoint}`);
    skillBtn.addEventListener('click', () => {
      // スキルの使用処理
      if (isProcessing) {
        message('warning', '敵のターン中にスキルを使用することはできません', 3000);
        return;
      }
      if (skillBtn.dataset.skill === 'mishoji') {
        return;
      }
      if (skillsData[skillBtn.dataset.skill].cost - globalGameState.player.reduceSkillPoint > globalGameState.player.skillsPoint) {
        message('warning', 'スキルポイントが不足しています', 2500);
        return;
      }
      if (skillBtn.classList.contains('locked')) {
        message('warning', '同じラウンドで1度しか使えないスキルです', 2500);
        return;
      }
      if ((skillsData[skillBtn.dataset.skill].enName === 'Invert' ||
         skillsData[skillBtn.dataset.skill].enName === 'Flux') && 
         document.querySelector('.dice').textContent === '？') {
        message('warning', 'ダイスをロールしてから使用してください', 3000)
        return;
      }
      useSkill(skillBtn.dataset.skill, skillBtn);
    });
    document.querySelector('.skills').appendChild(skillBtn);
  }
  playerAnimInGame.start();
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
  document.getElementById('dice-attack-button').disabled = false;
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
  isProcessing = true;
  document.getElementById('dice-attack-button').disabled = true;
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

export function toggleHold(event) {
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
  globalGameState.player.skillsPoint = Math.min(globalGameState.player.skillsPoint, globalGameState.player.maxSkillPoint);
  document.getElementById('skill-point').textContent = globalGameState.player.skillsPoint + (globalGameState.player.skillsPoint === globalGameState.player.maxSkillPoint ? '(最大)' : '');
  // 敵の攻撃
  await enemyAttack();
  // 次のターンの設定
  globalGameState.forStats.totalTurns++;
  globalGameState.player.rerollCount = 2;
  globalGameState.player.isAllAttack = false;
  document.querySelector('#dice-reroll-button').textContent = `リロール（残り${globalGameState.player.rerollCount}回）`;
  document.getElementById('dice-attack-button').disabled = false;
  setPhase(1);
  document.querySelectorAll('.dice').forEach(dice => {
    dice.classList.remove('hold');
    dice.removeEventListener('click', toggleHold);
    dice.textContent = '？';
  });
  document.querySelector('#dice-hand-info-title').textContent = `現在の役: ---`;
  document.querySelector('#dice-hand-info-effect-value').textContent = '---';
  executeTurnItems();
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
  isProcessing = false;
};

function executeTurnItems() {
  for (const id of globalGameState.player.items) {
    if (id === 3) {
      globalGameState.player.skillsPoint++;
    } else if (id === 4) {
      // すべての敵に1ダメージ
      for (const enemyId in globalGameState.enemies) {
        if (globalGameState.enemies[enemyId].hp > 0) {
          damage(enemyId, 1, true);
        }
      }
    } else if (id === 15) {
      damage('player', 2);
    }
  }
  Math.min(globalGameState.player.skillsPoint + 3, globalGameState.player.maxSkillPoint);
}