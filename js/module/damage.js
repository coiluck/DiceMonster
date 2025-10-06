// damage.js
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

import { renderBuff } from "./buff.js";
import { globalGameState } from "./gameState.js";

export async function executeHand(target, hand, dice) {
  switch (hand.handId) {
    case 'four card':
      for (const enemyId in globalGameState.enemies) {
        if (globalGameState.enemies[enemyId].hp > 0) {
          changeEnemyAttack(enemyId, -1);
        }
      }
      const buffsInForCard = ["shield", "damageReduction", "attack"];
      const randomIndexInForCard = Math.floor(Math.random() * buffsInForCard.length);
      addPlayerBuff(buffsInForCard[randomIndexInForCard], 1);
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0) * 3);
      break;
    case 'straight':
      globalGameState.player.isAllAttack = true;
      damage(target.dataset.uniqueId, Math.floor(dice.reduce((a, b) => a + b, 0) * 1.5));
      globalGameState.player.isAllAttack = false;

      const buffs = ["shield", "damageReduction", "attack"];
      for (let i = 0; i < globalGameState.player.items.filter(item => item === 10).length + 1; i++) {
        const randomIndex = Math.floor(Math.random() * buffs.length);
        addPlayerBuff(buffs[randomIndex], 1);
      }
      break;
    case 'full house':
      const attackReduction = 2 + globalGameState.player.items.filter(item => item === 9).length;
      for (const enemy in globalGameState.enemies) {
        changeEnemyAttack(enemy, -attackReduction, true);
      }
      damage(target.dataset.uniqueId, Math.floor(dice.reduce((a, b) => a + b, 0) * 1.5));
      heal('player', Math.floor(dice.reduce((a, b) => a + b, 0) / 2));
      break;
    case 'three card':
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0));
      const counts = dice.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});
      const sortedDice = [...dice].sort((a, b) => a - b);
      const shieldValue = sortedDice[1] * (globalGameState.player.items.filter(item => item === 11).length + 1);
      addPlayerBuff('shield', shieldValue);
      break;
    case 'all even':
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0));
      heal('player', Math.floor(dice.reduce((a, b) => a + b, 0) / 2));
      break;
    case 'all odd':
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0));
      heal('player', Math.floor(dice.reduce((a, b) => a + b, 0) / 2));
      break;
    case 'one pair':
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0));
      break;
    case 'no pair':
      damage(target.dataset.uniqueId, Math.floor(dice.reduce((a, b) => a + b, 0) / 2));
      break;
  }
}

export function heal(target, value) { // targetは1, 2, ...のようなuniqueIdかplayer
  if (target === 'player') {
    globalGameState.player.hp = Math.min(globalGameState.player.hp + value, globalGameState.player.maxHp);
    document.getElementById('player-hp').textContent = globalGameState.player.hp
    document.querySelector('#player-bar').style.width = `${globalGameState.player.hp / globalGameState.player.maxHp * 100}%`;
  } else {
    if (!globalGameState.enemies[target] || globalGameState.enemies[target].hp == 0) {
      return;
    }
    const newHp = globalGameState.enemies[target].hp += value;
    const targetEnemy = document.querySelector(`.card[data-unique-id="${target}"]`);
    if (!targetEnemy) console.warn('対象がありません');
    targetEnemy.querySelector('.enemy-hp').textContent = `HP: ${newHp}`;
    targetEnemy.dataset.enemyHp = newHp;
  }
}

import { gameOver, roundEnd } from './result.js';

export function damage(target, value, isFixedDamage = false) {
  console.log('攻撃対象: ', target, '攻撃力: ', value);
  if (target === 'player') {
    let actualDamage = Math.max(0, value - globalGameState.player.damageReduction);
    // シールドでダメージを吸収
    const damageToShield = Math.min(actualDamage, globalGameState.player.shield);
    globalGameState.player.shield -= damageToShield;
    actualDamage -= damageToShield;
    // 残りのダメージをHPに適用
    if (actualDamage > 0) {
      globalGameState.player.hp -= actualDamage;
    }
    // DOM更新
    document.querySelector('#player-buff-container .buff-shield .buff-number').textContent = globalGameState.player.shield;
    document.querySelector('#player-buff-container .buff-shield').style.display = globalGameState.player.shield === 0 ? 'none' : 'block';
    document.getElementById('player-hp').textContent = globalGameState.player.hp;
    document.querySelector('#player-bar').style.width = `${(globalGameState.player.hp / globalGameState.player.maxHp) * 100}%`;
    // ゲームオーバー処理
    if (globalGameState.player.hp <= 0) {
      gameOver();
      return;
    }
  } else {
    let totalDamageDealt = 0; // この攻撃で与えた総ダメージ

    const targets = (globalGameState.player.isAllAttack === true)
      ? Object.keys(globalGameState.enemies)
      : [target];

    targets.forEach(enemyId => {
      if (!globalGameState.enemies[enemyId] || globalGameState.enemies[enemyId].hp <= 0) {
        return;
      }

      let currentDamage = value;
      if (!isFixedDamage) {
        currentDamage += globalGameState.player.attack;
      }

      // ダメージは敵のHPを超えて計算
      totalDamageDealt += currentDamage;

      // 敵のHPを更新
      const newHp = globalGameState.enemies[enemyId].hp -= currentDamage;
      const targetEnemy = document.querySelector(`.card[data-unique-id="${enemyId}"]`);

      if (!targetEnemy) {
        console.warn('対象がありません');
        return;
      }

      if (newHp > 0) {
        targetEnemy.querySelector('.enemy-hp').textContent = `HP: ${newHp}`;
        targetEnemy.dataset.enemyHp = newHp;
      } else {
        targetEnemy.querySelector('.enemy-hp').textContent = `HP: 0`;
        targetEnemy.dataset.enemyHp = 0;
        // フェードアウト処理
        targetEnemy.querySelector('.enemy-name').classList.add('fade-out');
        targetEnemy.querySelector('.enemy-attack').classList.add('fade-out');
        targetEnemy.querySelector('.enemy-hp').classList.add('fade-out');
        targetEnemy.querySelector('img').classList.add('fade-out');
        setTimeout(() => {
          targetEnemy.innerHTML = '';
          targetEnemy.innerHTML += '<img src="./assets/images/defeatedCard.avif" class="defeated-card-image">';
          targetEnemy.querySelector('.defeated-card-image').classList.add('fade-in');
          // すべての敵のHPが0以下ならラウンド終了
          if (Object.values(globalGameState.enemies).every(enemy => enemy.hp <= 0)) {
            roundEnd();
          }
        }, 500);
      }
    });
    // 計算した総ダメージをglobalGameStateに加算
    globalGameState.forStats.totalDamage += totalDamageDealt;
  }
}
export function changeEnemyAttack(targetId, value, isThisTurnOnly = false) {
  if (!globalGameState.enemies[targetId]) {
    return;
  }
  if (globalGameState.enemies[targetId].hp <= 0) {
    return;
  }
  // 永続的な攻撃力か一時的な攻撃力か判別
  if (isThisTurnOnly) {
    globalGameState.enemies[targetId].attackInThisTurn += value;
  } else {
    const currentAttack = globalGameState.enemies[targetId].attack;
    globalGameState.enemies[targetId].attack = Math.max(0, currentAttack + value);
  }
  const targetEnemy = document.querySelector(`.card[data-unique-id="${targetId}"]`);
  if (!targetEnemy) {
    console.warn('対象がありません');
    return;
  };
  // 攻撃力の合計値を表示
  const totalAttack =
    Math.max(0, globalGameState.enemies[targetId].attack + globalGameState.enemies[targetId].attackInThisTurn);
  targetEnemy.querySelector('.enemy-attack').textContent = `${totalAttack}`;
}
export function addPlayerBuff(buffName, value) {
  if (globalGameState.player.items.includes(14) && buffName === "shield") {
    return; // 14番があるとシールドだめ
  }
  if (globalGameState.player.hasOwnProperty(buffName)) {
    globalGameState.player[buffName] += value;
    // DOMも更新
    renderBuff();
  } else {
    console.warn(`Invalid buff name: ${buffName}`);
  }
}


export async function enemyAttack() {
  await wait(500);
  for (const enemyId in globalGameState.enemies) {
    if (globalGameState.enemies[enemyId].hp > 0 && globalGameState.player.hp > 0) {
      damage('player', globalGameState.enemies[enemyId].attack + globalGameState.enemies[enemyId].attackInThisTurn);
    }
    await wait(500);
  }
}