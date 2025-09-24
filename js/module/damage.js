import { globalGameState } from "./gameState.js";

// damage.js
export async function executeHand(target, hand, dice) {
  switch (hand.handId) {
    case 'four card':
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0) * 3);
      for (const enemyId in globalGameState.enemies) {
        if (globalGameState.enemies[enemyId].hp > 0) {
          changeEnemyAttack(enemyId, -1);
        }
      }
      break;
    case 'straight':
      for (const enemyId in globalGameState.enemies) {
        if (globalGameState.enemies[enemyId].hp > 0) {
          damage(enemyId, Math.floor(dice.reduce((a, b) => a + b, 0) * 1.5));
        }
      }
      const buffs = ["shield", "damageReduction", "attack"];
      const randomIndex = Math.floor(Math.random() * buffs.length);
      addPlayerBuff(buffs[randomIndex], 1);
      break;
    case 'full house':
      damage(target.dataset.uniqueId, Math.floor(dice.reduce((a, b) => a + b, 0) * 1.5));
      heal('player', Math.floor(dice.reduce((a, b) => a + b, 0) / 2));
      for (const enemy in globalGameState.enemies) {
        changeEnemyAttack(enemy, -2);
      }
      break;
    case 'three card':
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0));
      const counts = dice.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});
      const threeKind = Object.entries(counts).find(([num, count]) => count === 3);
      addPlayerBuff('shield', Number(threeKind[0]));
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

function heal(target, value) { // targetは1, 2, ...のようなuniqueIdかplayer
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
function damage(target, value) {
  console.log('damage', target, value);
  //  あとでhpが0の処理を書く
  if (target === 'player') {
    globalGameState.player.hp -= value;
    document.getElementById('player-hp').textContent = globalGameState.player.hp
    document.querySelector('#player-bar').style.width = `${globalGameState.player.hp / globalGameState.player.maxHp * 100}%`;
  } else {
    if (!globalGameState.enemies[target] || globalGameState.enemies[target].hp == 0) {
      return;
    }
    const newHp = globalGameState.enemies[target].hp -= value;
    const targetEnemy = document.querySelector(`.card[data-unique-id="${target}"]`);
    if (!targetEnemy) console.warn('対象がありません');
    targetEnemy.querySelector('.enemy-hp').textContent = `HP: ${newHp}`;
    targetEnemy.dataset.enemyHp = newHp;
  }
}
function changeEnemyAttack(targetId, value, isThisTurnOnly = false) {
  if (!globalGameState.enemies[targetId]) {
    return;
  }
  // isThisTurnOnlyフラグに応じて、永続的な攻撃力か一時的な攻撃力を変更
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
function addPlayerBuff(buffName, value) {
  if (globalGameState.player.hasOwnProperty(buffName)) {
    globalGameState.player[buffName] += value;
    // DOMも更新
    document.querySelector('#player-buff-container .buff-shield .buff-number').textContent = globalGameState.player.shield;
    document.querySelector('#player-buff-container .buff-shield').style.display = globalGameState.player.shield === 0 ? 'none' : 'block';
    document.querySelector('#player-buff-container .buff-attack .buff-number').textContent = globalGameState.player.attack;
    document.querySelector('#player-buff-container .buff-attack').style.display = globalGameState.player.attack === 0 ? 'none' : 'block';
    document.querySelector('#player-buff-container .buff-reduction .buff-number').textContent = globalGameState.player.damageReduction;
    document.querySelector('#player-buff-container .buff-reduction').style.display = globalGameState.player.damageReduction === 0 ? 'none' : 'block';
  } else {
    console.warn(`Invalid buff name: ${buffName}`);
  }
}