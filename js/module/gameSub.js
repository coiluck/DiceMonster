// gameSub.js
import { globalGameState } from './gameState.js';
let itemData = null;
async function getItemData() {
  if (itemData) return itemData;
  const response = await fetch('item.json');
  itemData = await response.json();
  return itemData;
}

import { playSound } from './audio.js';

document.getElementById('item-button').addEventListener('click', async () => {
  playSound('button');
  document.getElementById('modal-item').classList.add('active');
  document.querySelector('#modal-item h3').textContent = window.currentLang === 'en' ? 'Item List' : 'アイテム一覧';
  // 所持アイテムを順に並び変え
  const data = await getItemData();
  const itemArray = [...globalGameState.player.items].sort((a, b) => a - b);
  document.querySelector('#modal-item .item-list-container').innerHTML = '';
  // 全部追加
  for (const itemId of itemArray) {
    const item = data.find(item => item.id === itemId);
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-list-item';
    if (window.currentLang === 'ja') {
      itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="item-list-item-textContainer">
        <div class="item-list-item-name">${item.name}</div>
        <div class="item-list-item-description">${item.description}</div>
      </div>
    `;
    } else {
      itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="item-list-item-textContainer">
        <div class="item-list-item-name">${item.enName}</div>
        <div class="item-list-item-description">${item.enDescription}</div>
      </div>
    `;
    }
    document.querySelector('#modal-item .item-list-container').appendChild(itemDiv);
  }
});

const handData = {
  'four card': {
    ja: {
      handName: 'フォーカード',
      text: `出目の合計 × 3 の大ダメージを与え、自分にランダムなバフを付与し、このラウンド中すべての敵の攻撃力 - 1`,
      skillpoint: '獲得スキルポイント: 5',
    },
    en: {
      handName: 'Four Card',
      text: `Deals massive damage (Total: x 3), grants a random buff to self, and reduces all enemies' attack by 1 for this round.`,
      skillpoint: 'Skill Point: 5',
    },
  },
  'straight': {
    ja: {
      handName: 'ストレート',
      text: `すべての敵に出目の合計値の1.5倍のダメージを与え、自分にランダムなバフを付与`,
      skillpoint: '獲得スキルポイント: 4',
    },
    en: {
      handName: 'Straight',
      text: `Deals 1.5x damage of the total dice value to all enemies and grants random buff(s) to self.`,
      skillpoint: 'Skill Point: 4',
    },
  },
  'full house': {
    ja: {
      handName: 'フルハウス',
      text: `出目の合計値の1.5倍のダメージを与え、与えたダメージの半分の量HPを回復し、敵のこのターンの攻撃力 - 2`,
      skillpoint: '獲得スキルポイント: 3',
    },
    en: {
      handName: 'Full House',
      text: `Deals 1.5x damage of the total dice value, heals for half the damage dealt, and reduces enemy's attack by 2 for this turn.`,
      skillpoint: 'Skill Point: 3',
    },
  },
  'three card': {
    ja: {
      handName: 'スリーカード',
      text: `出目の合計値のダメージを与え、3つそろっている出目の数だけ自分にシールドを付与`,
      skillpoint: '獲得スキルポイント: 2',
    },
    en: {
      handName: 'Three of a Kind',
      text: `Deals damage equal to the total dice value and grants self a shield of the number of three cards.`,
      skillpoint: 'Skill Point: 2',
    },
  },
  'all even': {
    ja: {
      handName: 'オールイーブン',
      text: `出目の合計値のダメージを与え、与えたダメージの半分の量HPを回復する`,
      skillpoint: '獲得スキルポイント: 2',
    },
    en: {
      handName: 'All Even',
      text: `Deals damage equal to the total dice value and heals for half the damage dealt.`,
      skillpoint: 'Skill Point: 2',
    },
  },
  'all odd': {
    ja: {
      handName: 'オールオッド',
      text: `出目の合計値のダメージを与え、与えたダメージの半分の量HPを回復する`,
      skillpoint: '獲得スキルポイント: 2',
    },
    en: {
      handName: 'All Odd',
      text: `Deals damage equal to the total dice value and heals for half the damage dealt.`,
      skillpoint: 'Skill Point: 2',
    },
  },
  'one pair': {
    ja: {
      handName: 'ワンペア',
      text: `出目の合計値のダメージ`,
      skillpoint: '獲得スキルポイント: 1',
    },
    en: {
      handName: 'One Pair',
      text: `Deals damage equal to the total dice value.`,
      skillpoint: 'Skill Point: 1',
    },
  },
  'no pair': {
    ja: {
      handName: 'ノーペア',
      text: `出目の合計値の半分のダメージ`,
      skillpoint: '獲得スキルポイント: 0',
    },
    en: {
      handName: 'No Pair',
      text: `Deals half the damage of the total dice value.`,
      skillpoint: 'Skill Point: 0',
    },
  },
};

document.getElementById('pair-button').addEventListener('click', () => {
  playSound('button');
  document.getElementById('modal-item').classList.add('active');
  document.querySelector('#modal-item h3').textContent = window.currentLang === 'en' ? 'Hand List' : '役一覧';
  document.querySelector('#modal-item .item-list-container').innerHTML = '';
  for (const handId in handData) {
    const langData = handData[handId][window.currentLang];
    const handDiv = document.createElement('div');
    handDiv.className = 'item-list-hand';
    handDiv.innerHTML = `
      <div class="item-list-hand-title">${langData.handName}</div>
      <div class="item-list-hand-description">${langData.text}</div>
      <div class="item-list-hand-description">${langData.skillpoint}</div>
    `;
    document.querySelector('#modal-item .item-list-container').appendChild(handDiv);
  }
});

document.getElementById('item-close-button').addEventListener('click', () => {
  resetItemListContainer();
  playSound('button');
});

// modal-gameが消えるときに毎回これを実行
// じゃないと前面にこれが表示されたまま次のことが始まっちゃう
export function resetItemListContainer() {
  document.getElementById('modal-item').classList.remove('active');
  setTimeout(() => {
    document.querySelector('#modal-item .item-list-container').scrollTop = 0;
  }, 300);
}
