import { globalGameState } from "./gameState.js";

// damage.js
export async function executeHand(target, hand, dice) {
  switch (hand.handId) {
    case 'four card':
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0) * 3);
      break;
    case 'straight':
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0));
      break;
    case 'full house':
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0));
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
      heal(target, Math.floor(dice.reduce((a, b) => a + b, 0) / 2));
      break;
    case 'all odd':
      damage(target.dataset.uniqueId, dice.reduce((a, b) => a + b, 0));
      heal(target, Math.floor(dice.reduce((a, b) => a + b, 0) / 2));
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
function addEnemyBuff(target, buffName, value) {
  if (!globalGameState.enemies[target]) {
    return;
  }
  globalGameState.enemies[target].buffs[buffName] = value;
}
function addPlayerBuff(buffName, value) {
  
}