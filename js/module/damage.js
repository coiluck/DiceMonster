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
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0) * 3, false, dice);
      break;
    case 'straight':
      globalGameState.player.isAllAttack = true;
      damage(target.dataset.uniqueId, Math.floor(dice.reduce((a, b) => a + b, 0) * 1.5), false, dice);
      globalGameState.player.isAllAttack = false;

      const buffs = ["shield", "damageReduction", "attack"];
      for (let i = 0; i < globalGameState.player.items.filter(item => item === 10).length + 1; i++) {
        const randomIndex = Math.floor(Math.random() * buffs.length);
        addPlayerBuff(buffs[randomIndex], 1);
      }
      break;
    case 'full house':
      const attackReduction = 2 + globalGameState.player.items.filter(item => item === 9).length;
      changeEnemyAttack(target.dataset.uniqueId, -attackReduction, true);
      damage(target.dataset.uniqueId, Math.floor(dice.reduce((a, b) => a + b, 0) * 1.5), false, dice);
      heal('player', Math.floor(dice.reduce((a, b) => a + b, 0) / 2));
      break;
    case 'three card':
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0), false, dice);
      const sortedDice = [...dice].sort((a, b) => a - b);
      const shieldValue = sortedDice[1] * (globalGameState.player.items.filter(item => item === 11).length + 1);
      addPlayerBuff('shield', shieldValue);
      break;
    case 'all even':
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0), false, dice);
      heal('player', Math.floor(dice.reduce((a, b) => a + b, 0) / 2));
      break;
    case 'all odd':
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0), false, dice);
      heal('player', Math.floor(dice.reduce((a, b) => a + b, 0) / 2));
      break;
    case 'one pair':
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0), false, dice);
      break;
    case 'no pair':
      damage(target.dataset.uniqueId, Math.floor(dice.reduce((a, b) => a + b, 0) / 2), false, dice);
      break;
  }
}

import { playSound } from './audio.js';

export function heal(target, value) { // targetは1, 2, ...のようなuniqueIdかplayer
  if (target === 'player') {
    globalGameState.player.hp = Math.min(globalGameState.player.hp + value, globalGameState.player.maxHp);
    document.getElementById('player-hp').textContent = globalGameState.player.hp
    document.querySelector('#player-bar').style.width = `${globalGameState.player.hp / globalGameState.player.maxHp * 100}%`;
  } else {
    if (!globalGameState.enemies[target] || globalGameState.enemies[target].hp == 0) {
      console.warn('対象がありません');
      return;
    }
    const newHp = Math.min(globalGameState.enemies[target].hp + value, 99);
    const targetEnemy = document.querySelector(`.card[data-unique-id="${target}"]`);
    if (!targetEnemy) console.warn('対象がありません');
    targetEnemy.querySelector('.enemy-hp').textContent = `HP: ${newHp}`;
    targetEnemy.dataset.enemyHp = newHp;
  }
}

import { gameOver, roundEnd } from './result.js';

export function damage(target, value, isFixedDamage = false, dices = []) {
  console.log('攻撃対象: ', target, '攻撃力: ', value);
  if (target === 'player') {
    playSound('attack');
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
    if (dices.length > 0) {
      playSound('attack');
    }
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
      if (!isFixedDamage && dices.length > 0) {
        // 特殊効果の設定
        const diceSum = dices.reduce((a, b) => a + b, 0);
        // ID:4 腐敗したシカ「偶数の出目でしかダメージを与えられない」
        if (globalGameState.enemies[enemyId].id === 4 && diceSum % 2 !== 0) {
          currentDamage = globalGameState.player.attack; // 出目によるダメージは0。基礎攻撃力分のみ
        }
        // ID:7 星を紡ぐ者「出目の合計値が素数の時に大ダメージ(2倍)」
        if (globalGameState.enemies[enemyId].id === 7) {
          const isPrime = num => {
            if (num <= 1) return false;
            for (let i = 2; i * i <= num; i++) {
              if (num % i === 0) return false;
            }
            return true;
          };
          if (isPrime(diceSum)) {
            currentDamage *= 2;
          }
        }
        // ID:9 黄昏の牙「出目の合計値が15以下の場合、受けるダメージを半減」
        if (globalGameState.enemies[enemyId].id === 9 && diceSum <= 15) {
          currentDamage = Math.ceil(currentDamage / 2);
        }
      }

      // ダメージは敵のHPを超えて計算
      totalDamageDealt += currentDamage;

      // 敵のHPを更新
      const newHp = globalGameState.enemies[enemyId].hp -= currentDamage;
      const targetEnemy = document.querySelector(`.card[data-unique-id="${enemyId}"]`);

      if (globalGameState.enemies[enemyId].id === 12 && currentDamage > 0) {
        damage('player', 2, true); // 固定ダメージとして扱う
      }

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
        // 15「天を喰らう咆哮」の場合 -> 残りの敵を強化
        if (globalGameState.enemies[enemyId].id === 15) {
          for (const enemyId in globalGameState.enemies) {
            if (globalGameState.enemies[enemyId].hp > 0) {
              heal(enemyId, 10);
              changeEnemyAttack(enemyId, 2);
            }
          }
        }
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

let enemyData;
async function getEnemyData() {
  if (!enemyData) {
    const response = await fetch('enemy.json');
    enemyData = await response.json();
  }
  return enemyData;
}

import { addTooltipEvents } from './addToolTip.js';

export async function enemyAttack() {
  await wait(750);
  for (const enemyId in globalGameState.enemies) {
    if (globalGameState.enemies[enemyId].hp > 0 && globalGameState.player.hp > 0) {
      // 敵の攻撃間隔
      await wait(500);
      // 攻撃
      damage('player', globalGameState.enemies[enemyId].attack + globalGameState.enemies[enemyId].attackInThisTurn);
      // bossの場合
      if (globalGameState.enemies[enemyId].id === 14) {
        heal(enemyId, Math.floor(globalGameState.enemies[enemyId].attack + globalGameState.enemies[enemyId].attackInThisTurn / 2));
        changeEnemyAttack(enemyId, 1);
      } else if (globalGameState.enemies[enemyId].id === 15) {
        const maxEnemy = globalGameState.difficulty === 'hard' ? 4 : 3; // 最大敵数

        if (Object.keys(globalGameState.enemies).length < maxEnemy) {
          // 敵を召喚
          const dragons = [11, 12, 13];
          const randomDragon = dragons[Math.floor(Math.random() * dragons.length)];
          const enemyData = await getEnemyData();
          
          // 新しいuniqueIdを生成（既存の最大ID + 1）
          const existingIds = Object.keys(globalGameState.enemies).map(Number);
          const newUniqueId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
          
          const enemyInfo = enemyData.find(e => e.id === randomDragon);
          
          // globalGameStateに入れる
          globalGameState.enemies[newUniqueId] = {
            id: randomDragon,
            hp: enemyInfo.hp,
            attack: enemyInfo.attack,
            attackInThisTurn: 0,
          };
          
          // 要素をDOMに作成
          const enemyCard = document.createElement('div');
          enemyCard.className = 'card';
          enemyCard.classList.add('enemy');
          enemyCard.dataset.enemyId = randomDragon;
          enemyCard.dataset.uniqueId = newUniqueId;
          enemyCard.dataset.enemyHp = enemyInfo.hp;
        
          const enemyName = window.currentLang === 'en' ? enemyInfo.enName : enemyInfo.name;
          const enemyDescription = window.currentLang === 'en' ? enemyInfo.enDescription : enemyInfo.description;
        
          enemyCard.innerHTML = `
            <p class="enemy-attack">${enemyInfo.attack}</p>
            <p class="enemy-name">${enemyName}</p>
            <img src="./assets/images/enemy/${enemyInfo.image}">
            <p class="enemy-hp">HP: ${enemyInfo.hp}</p>
          `;
          document.getElementById('enemy-container').appendChild(enemyCard);
          
          // 説明がある場合
          if (enemyDescription) {
            enemyCard.style.borderColor = 'rgba(0, 174, 255, 0.5)';
            addTooltipEvents(enemyCard, enemyDescription, true);
          }
        }
      }
    }
  }
}