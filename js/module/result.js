// result.js
import { globalGameState } from "./gameState.js";
import { message } from "./message.js";
import { changeModal } from "./changeModal.js";

export function gameOver() {
  console.log('gameOver');
}

export function roundEnd() {
  changeModal('result', null, 500, false);
  setUpResult();
  setTimeout(() => {
    document.getElementById('result-header').classList.add('active');
    document.querySelector('#result-header .result-header-round').classList.add('active');
    document.getElementById('result-content').classList.add('active');
  }, 500);
}

import { skillsData } from './skills.js';
let itemData = null;
async function getItemData() {
  if (!itemData) {
    const response = await fetch('item.json');
    itemData = await response.json();
  }
  return itemData;
}

async function setUpResult() {
  document.querySelector('#result-header .result-header-round').innerHTML = `Round ${globalGameState.round} >> ${globalGameState.round + 1}`;
  // 獲得アイテムを抽選
  const reward = await getReward();
  console.log(reward);
  // 獲得アイテムを表示
  const resultContent = document.getElementById('result-content');
  resultContent.innerHTML = '';
  const itemDataList = await getItemData(); // アイテムデータを確実に取得

  // 報酬のペアごとに選択肢のコンテナを作成
  for (const rewardPair of reward) {
    const choiceContainer = document.createElement('div');
    choiceContainer.className = 'result-choice-container';

    const containerTitle = document.createElement('p');
    containerTitle.className = 'result-choice-container-title';
    containerTitle.textContent = '以下の選択肢からひとつ選んでください';
    choiceContainer.appendChild(containerTitle);

    const wrapper = document.createElement('div');
    wrapper.className = 'result-choice-container-wrapper';

    // 各報酬（スキルまたはアイテム）の要素を作成
    for (const rewardId of rewardPair) {
      let name, description, rewardType;

      // rewardIdの型をチェックして、スキルかアイテムかを判別
      if (typeof rewardId === 'string') {
        // スキルの場合
        const skill = skillsData[rewardId];
        name = skill.name;
        description = skill.description;
        rewardType = 'skill';
      } else {
        // アイテムの場合
        const item = itemDataList.find(i => i.id === rewardId);
        name = item.name;
        description = item.description;
        rewardType = 'item';
      }

      const itemDiv = document.createElement('div');
      itemDiv.className = 'result-choice-container-item';

      const typeP = document.createElement('p');
      typeP.className = 'result-choice-container-type';
      // rewardTypeに基づいてテキストを設定
      typeP.textContent = rewardType === 'skill' ? 'スキル' : 'アイテム';
      itemDiv.appendChild(typeP);

      const titleP = document.createElement('p');
      titleP.className = 'result-choice-container-item-title';
      titleP.textContent = name;

      const descriptionP = document.createElement('p');
      descriptionP.className = 'result-choice-container-item-description';
      descriptionP.textContent = description;
      const button = document.createElement('button');
      button.className = 'result-choice-container-item-button';
      button.textContent = '選択';
      // data属性を追加
      button.dataset.rewardType = rewardType;
      button.dataset.rewardId = rewardId;
      // クリックイベントリスナーを追加
      button.addEventListener('click', (event) => {
        const clickedButton = event.currentTarget;
        // コンテナ内のすべてのボタンを無効化
        const container = clickedButton.closest('.result-choice-container');
        const allButtonsInContainer = container.querySelectorAll('.result-choice-container-item-button');
        allButtonsInContainer.forEach(btn => {
          btn.disabled = true;
        });

        // 報酬獲得の処理
        const type = clickedButton.dataset.rewardType;
        const id = clickedButton.dataset.rewardId;
        console.log(`報酬を獲得。タイプ: ${type}, ID: ${id}`);
        // あとで書く
      });
      itemDiv.appendChild(titleP);
      itemDiv.appendChild(descriptionP);
      itemDiv.appendChild(button);
      wrapper.appendChild(itemDiv);
    }
    choiceContainer.appendChild(wrapper);
    resultContent.appendChild(choiceContainer);
  }
}

async function getReward() {
  const rewards = [];

  for (let i = 0; i < (globalGameState.round > 7 ? 2 : 1); i++) {
    const rewardPair = [];
    // 1ペアにつき2回抽選を行う
    for (let j = 0; j < 2; j++) {
      const RewardContentWeight = {
        skill: 0.3,
        item: 0.7,
      };
      const random = Math.random();
      if (random < RewardContentWeight.skill) {
        // スキルを抽選
        let eligibleRanks = [];
        switch (true) {
          case (globalGameState.round >= 1 && globalGameState.round <= 4):
            eligibleRanks = [1];
            break;
          case (globalGameState.round >= 5 && globalGameState.round <= 8):
            eligibleRanks = [1, 2];
            break;
          case (globalGameState.round >= 9 && globalGameState.round <= 12):
            eligibleRanks = [2, 3];
            break;
          case (globalGameState.round === 13 || globalGameState.round === 14):
            eligibleRanks = [3];
            break;
          default:
            message('warning', '重大なエラー: ラウンドが正しくありません', 'infinity');
            break;
        }
        const availableSkills = Object.entries(skillsData).filter(([key, skill]) =>
          eligibleRanks.includes(skill.rank) && !rewardPair.includes(key)
        );
        if (availableSkills.length === 0) {
          console.warn('重大なエラー: 該当ランクのスキルが見つかりません');
          continue;
        }
        const randomIndex = Math.floor(Math.random() * availableSkills.length);
        const selectedSkillId = availableSkills[randomIndex][0]; // スキルのID ('tsuigeki'など) を取得
        rewardPair.push(selectedSkillId);
      } else {
        // アイテムを抽選
        let eligibleRanks = [];
        switch (true) {
          case (globalGameState.round >= 1 && globalGameState.round <= 6):
            eligibleRanks = [1];
            break;
          case (globalGameState.round >= 7):
            eligibleRanks = [1, 2];
            break;
          default:
            message('warning', '重大なエラー: ラウンドが正しくありません', 'infinity');
            break;
        }
        const itemDataList = await getItemData();
        const availableItems = itemDataList.filter(item => 
          eligibleRanks.includes(item.rank) && !rewardPair.includes(item.id)
        );
        if (availableItems.length === 0) {
          console.warn('重大なエラー: 該当ランクのアイテムが見つかりません');
          continue;
        }
        const randomIndex = Math.floor(Math.random() * availableItems.length);
        const selectedItemId = availableItems[randomIndex].id; // アイテムのID (1など) を取得
        rewardPair.push(selectedItemId);
      }
    }
    rewards.push(rewardPair);
  }
  return rewards;
}