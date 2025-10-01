// skills.js
export const skillsData = {
  mishoji: {
    name: '-',
    enName: '-',
    rank: 0,
    description: 'スキルを所持していません',
    enDescription: 'No skills acquired',
    cost: 0,
  },
  tsuigeki: {
    name: '追撃',
    enName: 'Aftershock',
    rank: 1,
    description: '敵全体に5ダメージ',
    enDescription: 'Deal 5 damage to all enemies.',
    cost: 4,
  },
  kinen: {
    name: '祈念',
    enName: 'Solace',
    rank: 2,
    description: '自分のHPを5回復',
    enDescription: 'Restore 5 HP to yourself.',
    cost: 5,
  },
  hanten: {
    name: '反転',
    enName: 'Invert',
    rank: 3,
    description: '選んだサイコロ1つの出目を反転させる。（1 ⇔ 6, 2 ⇔ 5, 3 ⇔ 4）',
    enDescription: 'Invert the value of a chosen die. (1 ⇔ 6, 2 ⇔ 5, 3 ⇔ 4)',
    cost: 6,
  },  
  fujaku: {
    name: '封弱',
    enName: 'Blight',
    rank: 1,
    description: 'このターン、すべての敵の攻撃力 - 1',
    enDescription: 'Reduce the attack power of all enemies by 1 for this turn.',
    cost: 3,
  },
  rinten: {
    name: '輪転',
    rank: 2,
    enName: 'Flux',
    description: 'サイコロ1つの出目を+1する（ループ式）',
    enDescription: 'Increase the value of a single die by 1 (values loop).',
    cost: 5,
  },
  gototsu: {
    name: '護突',
    rank: 1,
    enName: 'Aegis',
    description: 'シールドを5得る',
    enDescription: 'Gain 5 Shield.',
    cost: 4,
  },
  shinka: {
    name: '進化',
    rank: 3,
    enName: 'Ascension',
    isLimmitedTimes: true,
    description: 'このラウンド中、強化状態になり最大HPが上昇 & 与えるダメージ + 2',
    enDescription: 'For the remainder of the round, enter an enhanced state, increasing max HP and adding 2 to all damage dealt.',
    cost: 8,
  },
  kyofun: {
    name: '狂奮',
    rank: 2,
    enName: 'Bloodlust',
    isLimmitedTimes: true,
    description: '自分のHPを半分消費し、このラウンド中、与えるダメージ + 2 & ダメージ軽減 1',
    enDescription: 'Consume half of your current HP. For the remainder of the round, increase damage dealt by 2 and gain 1 damage reduction.',
    cost: 7,
  },
  sengun: {
    name: '殲群',
    enName: 'Decimate',
    rank: 3,
    isLimmitedTimes: true,
    description: 'このターン、すべての敵に攻撃をあてる',
    enDescription: 'Strike all enemies this turn.',
    cost: 8,
  },
};

import { globalGameState } from "./gameState.js";
import { damage, heal, changeEnemyAttack, addPlayerBuff } from "./damage.js"
import { toggleHold } from "../game.js";
import { message, deleteMessage } from "./message.js";

export function useSkill(skillId, pushedButton) {
  // 処理中はdice-buttonsのボタンを無効化
  document.getElementById('dice-roll-button').disabled = true;
  document.getElementById('dice-reroll-button').disabled = true;
  document.getElementById('dice-confirm-button').disabled = true;
  document.getElementById('dice-attack-button').disabled = true;
  // skillsPointを消費……なんで複数形なんだろう
  const consumeCost = skillsData[skillId].cost - globalGameState.player.reduceSkillPoint;
  globalGameState.player.skillsPoint -= consumeCost;
  // 発動
  switch(skillId) {
    case 'tsuigeki':
      for (const enemyId in globalGameState.enemies) {
        if (globalGameState.enemies[enemyId].hp > 0) {
          damage(enemyId, 5);
        }
      }
      break;
    case 'kinen':
      heal('player', 5);
      break;
    case 'hanten':
      // まずHoldのイベントリスナを消去
      document.querySelectorAll('.dice').forEach(dice => {
        dice.removeEventListener('click', toggleHold);
      });
      // ボタン選択を可能にする
      message('info', '反転させるサイコロを選択してください', 'infinity')
      document.querySelectorAll('.dice').forEach(dice => {
        dice.addEventListener('click', invertDice);
      });
      // イベントリスナはinvertDiceで再設定
      break;
    case 'fujaku':
      for (const enemyId in globalGameState.enemies) {
        if (globalGameState.enemies[enemyId].hp > 0) {
          changeEnemyAttack(enemyId, -1, true);
        }
      }
      break;
    case 'rinten':
      // まずHoldのイベントリスナを消去
      document.querySelectorAll('.dice').forEach(dice => {
        dice.removeEventListener('click', toggleHold);
      });
      // ボタン選択を可能にする
      message('info', '反転させるサイコロを選択してください', 'infinity')
      document.querySelectorAll('.dice').forEach(dice => {
        dice.addEventListener('click', fluxDice);
      });
      // イベントリスナはfluxDiceで再設定
      break;
    case 'gototsu':
      addPlayerBuff('shield', 5);
      break;
    case 'shinka':
      document.querySelector('.game-image-container img').src = './assets/images/9-8-8-4.webp';
      document.querySelector('.game-image-container img').classList.add('ascension');
      globalGameState.maxHp = 70;
      heal('player', 20);
      addPlayerBuff('attack', 2);
      break;
    case 'kyofun':
      damage('player', Math.floor(globalGameState.player.hp / 2));
      addPlayerBuff('damageReduction', 1);
      addPlayerBuff('attack', 2);
      break;
    case 'sengun':
      globalGameState.player.isAllAttack = true;
      break;
    default:
      console.warn(`failed to use skill: Invalid skill id (${skillKey})`);
      break;
  }
  // 再使用不可の場合は設定
  if (skillsData[skillId].isLimmitedTimes) {
    pushedButton.classList.add('locked');
  }
  // スキルポイントを更新
  document.getElementById('skill-point').textContent = globalGameState.player.skillsPoint + (globalGameState.player.skillsPoint === globalGameState.player.maxSkillPoint ? '(最大)' : '')int);
  // 処理が終わったのでdice-buttonsのボタンを有効化
  document.getElementById('dice-roll-button').disabled = false;
  document.getElementById('dice-reroll-button').disabled = false;
  document.getElementById('dice-confirm-button').disabled = false;
  document.getElementById('dice-attack-button').disabled = false;
}

import { judgeHand } from './judgeHand.js'

function invertDice(event) {
  // まず反転用のイベントリスナを削除
  document.querySelectorAll('.dice').forEach(dice => {
    dice.removeEventListener('click', invertDice);
  });
  deleteMessage();
  // 反転
  const targetNum = Number(event.currentTarget.textContent);
  const newNum = 7 - targetNum;
  event.currentTarget.textContent = newNum;
  // 役を更新
  const hand = judgeHand();
  document.querySelector('#dice-hand-info-title').textContent = `現在の役: ${hand.handName}`;
  document.querySelector('#dice-hand-info-effect-value').textContent = hand.text;
  // イベントリスナを再設定
  document.querySelectorAll('.dice').forEach(dice => {
    dice.addEventListener('click', toggleHold);
  });
}

function fluxDice(event) {
  // まず輪転用のイベントリスナを削除
  document.querySelectorAll('.dice').forEach(dice => {
    dice.removeEventListener('click', fluxDice);
  });
  deleteMessage();
  // 輪転
  const targetNum = Number(event.currentTarget.textContent);
  const newNum = targetNum + 1;
  event.currentTarget.textContent = newNum;
  // 役を更新
  const hand = judgeHand();
  document.querySelector('#dice-hand-info-title').textContent = `現在の役: ${hand.handName}`;
  document.querySelector('#dice-hand-info-effect-value').textContent = hand.text;
  // イベントリスナを再設定
  document.querySelectorAll('.dice').forEach(dice => {
    dice.addEventListener('click', toggleHold);
  });
}