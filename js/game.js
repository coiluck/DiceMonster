// game.js
document.querySelector('.top-continue-button').addEventListener('click', () => {
  initGame();
});

import { globalGameState, setGlobalGameState } from './module/gameState.js';
import { addTooltipEvents } from './module/addToolTip.js';

let isProcessing;

export function initGame() {
  chooseEnemy(globalGameState.round, globalGameState.difficulty);
  setUpPlayer();
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
  const enemySpawnSettings = [
    {
      rounds: { start: 1, end: 2 },
      difficulties: {
        easy: {
          guaranteedRank: 3,          // 確定で出現する敵のランク
          additionalRankPoints: 0,    // 追加で選出される敵のランクポイント上限
          maxAdditionalEnemies: 0     // 追加で選出される敵の最大数
        },
        normal: {
          guaranteedRank: 3,
          additionalRankPoints: 0,
          maxAdditionalEnemies: 0
        },
        hard: {
          guaranteedRank: 3,
          additionalRankPoints: 3,
          maxAdditionalEnemies: 1 // 合計2体
        }
      }
    },
    {
      rounds: { start: 3, end: 5 },
      difficulties: {
        easy: {
          guaranteedRank: 3,
          additionalRankPoints: 3,
          maxAdditionalEnemies: 1 // 合計2体
        },
        normal: {
          guaranteedRank: 5,
          additionalRankPoints: 4,
          maxAdditionalEnemies: 1 // 合計2体
        },
        hard: {
          guaranteedRank: 6,
          additionalRankPoints: 5,
          maxAdditionalEnemies: 1 // 合計2体
        }
      }
    },
    {
      rounds: { start: 6, end: 8 },
      difficulties: {
        easy: {
          guaranteedRank: 5,
          additionalRankPoints: 4,
          maxAdditionalEnemies: 1 // 合計2体
        },
        normal: {
          guaranteedRank: 6,
          additionalRankPoints: 5,
          maxAdditionalEnemies: 1 // 合計2体
        },
        hard: {
          guaranteedRank: 6,
          additionalRankPoints: 9,
          maxAdditionalEnemies: 2 // 合計3体
        }
      }
    },
    {
      rounds: { start: 9, end: 11 },
      difficulties: {
        easy: {
          guaranteedRank: 6,
          additionalRankPoints: 5,
          maxAdditionalEnemies: 1 // 合計2体
        },
        normal: {
          guaranteedRank: 7,
          additionalRankPoints: 10,
          maxAdditionalEnemies: 2 // 合計3体
        },
        hard: {
          guaranteedRank: 7,
          additionalRankPoints: 15,
          maxAdditionalEnemies: 3 // 合計4体
        }
      }
    },
    {
      rounds: { start: 12, end: 14 },
      difficulties: {
        easy: {
          guaranteedRank: 7,
          additionalRankPoints: 6,
          maxAdditionalEnemies: 1 // 合計2体
        },
        normal: {
          guaranteedRank: 8,
          additionalRankPoints: 15,
          maxAdditionalEnemies: 2 // 合計3体
        },
        hard: {
          guaranteedRank: 8,
          additionalRankPoints: 18,
          maxAdditionalEnemies: 3 // 合計4体
        }
      }
    },
    {
      rounds: { start: 15, end: 15 }, // ボスラウンド
      difficulties: {
        easy: {
          isBossRound: true,
          guaranteedBosses: 1,      // ボス以外は出現しない
          additionalRankPoints: 0,
          maxAdditionalEnemies: 0
        },
        normal: {
          isBossRound: true,
          guaranteedBosses: 1,
          additionalRankPoints: 0,
          maxAdditionalEnemies: 0
        },
        hard: {
          isBossRound: true,
          guaranteedBosses: 1,
          additionalRankPoints: 0,
          maxAdditionalEnemies: 0
        }
      }
    }
  ];
  const enemyData = await getEnemyData();

  // 設定
  const setting = enemySpawnSettings.find(s => round >= s.rounds.start && round <= s.rounds.end).difficulties[difficulty];
  const bosses = enemyData.filter(e => e.isBoss);
  const normalEnemies = enemyData.filter(e => !e.isBoss);
  let enemies = [];

  if (setting.isBossRound) { // ボスラウンドの処理
    for (let i = 0; i < setting.guaranteedBosses; i++) {
      const randomIndex = Math.floor(Math.random() * bosses.length);
      const selectedBoss = bosses.splice(randomIndex, 1)[0];
      enemies.push(selectedBoss);
      globalGameState.forStats.bossName = selectedBoss.name;
      console.log(globalGameState.forStats.bossName, selectedBoss);
    }
  } else { // 通常ラウンドの処理
  // 確定枠の敵を選出
    const guaranteedCandidates = normalEnemies.filter(e => e.rank === setting.guaranteedRank);
    if (guaranteedCandidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * guaranteedCandidates.length);
      enemies.push(guaranteedCandidates[randomIndex]);
    } else {
      console.warn(`ランク ${setting.guaranteedRank} の確定枠の敵が見つかりませんでした。`);
    }

    // 追加枠の敵を選出
    if (setting.maxAdditionalEnemies > 0 && setting.additionalRankPoints > 0) {
      let bestCombination = [];
      let bestScore = Infinity; // 目標ポイントとの差（小さいほど良い）
      // 最適な組み合わせを探す
      for (let i = 0; i < 10; i++) {
        let currentCombination = [];
        let currentRankSum = 0;
        // 候補となる敵（既に追加済みの敵は除く）
        let candidates = normalEnemies.filter(e => 
          !enemies.some(existing => existing.id === e.id) && e.rank <= setting.additionalRankPoints
        );
        // maxAdditionalEnemiesの数だけ敵を選ぶ
        for (let j = 0; j < setting.maxAdditionalEnemies; j++) {
          // 残りランクポイントで追加可能な敵だけ
          const availableCandidates = candidates.filter(e => 
            e.rank <= (setting.additionalRankPoints - currentRankSum) &&
            !currentCombination.some(c => c.id === e.id)
          );
          if (availableCandidates.length === 0) break; // 追加できる敵がいない場合は終了

          const randomIndex = Math.floor(Math.random() * availableCandidates.length);
          const selected = availableCandidates[randomIndex];
        
          currentCombination.push(selected);
          currentRankSum += selected.rank;
        }
        const currentScore = setting.additionalRankPoints - currentRankSum;
        // より目標ポイントに近い組み合わせが見つかったら更新
        if (currentScore < bestScore) {
          bestScore = currentScore;
          bestCombination = currentCombination;
        }
      }
      // 最適だった組み合わせを最終的な敵リストに追加
      enemies.push(...bestCombination);
    }
  }
  // 最終的に選ばれた敵のID配列を生成
  const enemyIds = enemies.map(e => e.id);
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

    const enemyName = window.currentLang === 'en' ? enemy.enName : enemy.name;
    const enemyDescription = window.currentLang === 'en' ? enemy.enDescription : enemy.description;

    enemyCard.innerHTML = `
      <p class="enemy-attack">${enemy.attack}</p>
      <p class="enemy-name">${enemyName}</p>
      <img src="./assets/images/enemy/${enemy.image}">
      <p class="enemy-hp">HP: ${enemy.hp}</p>
    `;
    document.getElementById('enemy-container').appendChild(enemyCard);
    // 説明がある場合
    if (enemyDescription) {
      enemyCard.style.borderColor = 'rgba(0, 174, 255, 0.5)';
      addTooltipEvents(enemyCard, enemyDescription, true);
    }
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
import { playerAnimInGame, playerAnimOfAscension } from './module/characterAnimation.js';
import { playSound } from './module/audio.js';

function setUpPlayer() {
  // 進化スキルのリセット
  const ascensionImg = document.querySelector('.card.player .game-image-container img.ascension');
  if (ascensionImg) {
    ascensionImg.classList.remove('ascension');
    playerAnimOfAscension.stop();
    playerAnimInGame.start();
    globalGameState.player.maxHp = 50;
    globalGameState.player.hp = Math.min(globalGameState.player.hp, globalGameState.player.maxHp);
  }
  // buffの設定
  globalGameState.player.maxHp = 50;
  globalGameState.player.shield = 0;
  globalGameState.player.damageReduction = 0;
  globalGameState.player.attack = 0;
  globalGameState.player.reduceSkillPoint = 0;
  globalGameState.player.maxSkillPoint = 10;
  globalGameState.player.isAllAttack = false;
  // globalGameState.player.skillsPoint = 0; <- これ引き継いだほうが面白いのでは
  document.querySelector('#player-bar').style.width = `${globalGameState.player.hp / globalGameState.player.maxHp * 100}%`;
  document.querySelector('#player-hp').textContent = globalGameState.player.hp;
  document.querySelector('#player-max-hp').textContent = globalGameState.player.maxHp;
  document.querySelector('#skill-point').textContent = globalGameState.player.skillsPoint;
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
    const selfDamage = globalGameState.player.items.filter(n => n === 15).length;
    damage('player', 2 * selfDamage);
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
    skillBtn.textContent = window.currentLang === 'en' ? skillsData[skill].enName : skillsData[skill].name;
    skillBtn.dataset.skill = skill;
    addTooltipEvents(skillBtn, window.currentLang === 'en' ? `${skillsData[skill].enDescription} Cost: ${skillsData[skill].cost - globalGameState.player.reduceSkillPoint}` : `${skillsData[skill].description} 消費ポイント: ${skillsData[skill].cost - globalGameState.player.reduceSkillPoint}`);
    skillBtn.addEventListener('click', () => {
      // スキルの使用処理
      if (isProcessing) {
        playSound('disable');
        message('warning', window.currentLang === 'en' ? 'Cannot use skills during enemy turns' : '敵のターン中にスキルを使用することはできません', 3000);
        return;
      }
      if (skillBtn.dataset.skill === 'mishoji') {
        playSound('disable');
        return;
      }
      if (skillsData[skillBtn.dataset.skill].cost - globalGameState.player.reduceSkillPoint > globalGameState.player.skillsPoint) {
        playSound('disable');
        message('warning', window.currentLang === 'en' ? 'Skill points are insufficient' : 'スキルポイントが不足しています', 2500);
        return;
      }
      if (skillBtn.classList.contains('locked')) {
        playSound('disable');
        message('warning', window.currentLang === 'en' ? 'This skill can only be used once per round' : '同じラウンドで1度しか使えないスキルです', 2500);
        return;
      }
      if ((skillsData[skillBtn.dataset.skill].enName === 'Invert' ||
      skillsData[skillBtn.dataset.skill].enName === 'Flux') && 
      document.querySelector('.dice').textContent === '？') {
        playSound('disable');
        message('warning', window.currentLang === 'en' ? 'Roll the dice before using' : 'ダイスをロールしてから使用してください', 3000)
        return;
      }
      useSkill(skillBtn.dataset.skill, skillBtn);
      playSound('metallic');
    });
    document.querySelector('.skills').appendChild(skillBtn);
  }
  playerAnimInGame.start();
}

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
    playSound('disable');
    message('warning', window.currentLang === 'en' ? 'No rerolls left' : 'リロール回数がありません', 3000);
    return;
  }
  rollDice();
  globalGameState.player.rerollCount--;
  document.querySelector('#dice-reroll-button').textContent = window.currentLang === 'en' ? `Reroll (${globalGameState.player.rerollCount} left)` : `リロール（残り${globalGameState.player.rerollCount}回）`;
  setPhase(2); 
});
document.getElementById('dice-confirm-button').addEventListener('click', () => {
  playSound('metallic');
  setPhase(3);
});
document.getElementById('dice-attack-button').addEventListener('click', () => {
  playSound('metallic');
  isProcessing = true;
  document.getElementById('dice-attack-button').disabled = true;
  document.querySelectorAll('.card.enemy, .card.boss').forEach(enemy => {
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
  playSound('dice');
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
    document.querySelector('#dice-hand-info-title').textContent = window.currentLang === 'en' ? `Current Hand: ${hand.handName}` : `現在の役: ${hand.handName}`;
    document.querySelector('#dice-hand-info-effect-value').textContent = hand.text;
  }, 1000);
}

export function toggleHold(event) {
  playSound('button');
  event.currentTarget.classList.toggle('hold');
}

import { executeHand, enemyAttack, heal } from './module/damage.js';

function decideAttackTarget(event) {
  processTurn(event.currentTarget);
}
async function processTurn(target) {
  // すべてのtargetとイベントリスナーを解除
  document.querySelectorAll('.card.enemy, .card.boss').forEach(card => {
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
  // 戦闘が続行中の場合はターン数をカウント
  if (Object.values(globalGameState.enemies).some(enemy => enemy.hp > 0) && globalGameState.player.hp > 0) {
    globalGameState.forStats.totalTurns++;
  }
  // 次のターンの設定
  globalGameState.player.rerollCount = 2;
  globalGameState.player.isAllAttack = false;
  document.querySelector('#dice-reroll-button').textContent = window.currentLang === 'en' ? `Reroll (${globalGameState.player.rerollCount} left)` : `リロール（残り${globalGameState.player.rerollCount}回）`;
  document.getElementById('dice-attack-button').disabled = false;
  setPhase(1);
  document.querySelectorAll('.dice').forEach(dice => {
    dice.classList.remove('hold');
    dice.removeEventListener('click', toggleHold);
    dice.textContent = '？';
  });
  document.querySelector('#dice-hand-info-title').textContent = window.currentLang === 'en' ? 'Current Hand: ---' : '現在の役: ---';
  document.querySelector('#dice-hand-info-effect-value').textContent = '---';
  for (const enemyId in globalGameState.enemies) {
    if (globalGameState.enemies[enemyId].hp > 0) {
      // total attackをリセット
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
      // 凍星竜の場合はHPを回復
      if (globalGameState.enemies[enemyId].id === 13) {
        heal(enemyId, 2);
      }
    }
  }
  if (Object.values(globalGameState.enemies).some(enemy => enemy.hp > 0) && globalGameState.player.hp > 0) {
    executeTurnItems(); // アイテムの効果を反映
    console.log('--- ターン終了 ---');
  }
  isProcessing = false;
};

function executeTurnItems() {
  const skillPointGain = globalGameState.player.items.filter(id => id === 3).length;
  if (skillPointGain > 0) {
    globalGameState.player.skillsPoint += skillPointGain;
  }
  const areaDamageCount = globalGameState.player.items.filter(id => id === 4).length;
  if (areaDamageCount > 0) {
    for (const enemyId in globalGameState.enemies) {
      if (globalGameState.enemies[enemyId].hp > 0) {
        damage(enemyId, 1 * areaDamageCount, true);
      }
    }
  }
  const selfDamageCount = globalGameState.player.items.filter(id => id === 15).length;
  if (selfDamageCount > 0) {
    damage('player', 2 * selfDamageCount);
  }
  globalGameState.player.skillsPoint = Math.min(globalGameState.player.skillsPoint, globalGameState.player.maxSkillPoint);
}