// judgeHand.js
import { message } from './message.js';
import { globalGameState } from './gameState.js';

const handData = {
  'four card': {
    ja: {
      handName: 'フォーカード',
      text: (sum) => `出目の合計(${sum}) × 3 の大ダメージを与え、自分にランダムなバフを付与し、このラウンド中すべての敵の攻撃力 - 1`,
    },
    en: {
      handName: 'Four Card',
      text: (sum) => `Deals massive damage (Total: ${sum} x 3), grants a random buff to self, and reduces all enemies' attack by 1 for this round.`,
    },
  },
  'straight': {
    ja: {
      handName: 'ストレート',
      text: (sum, buffCount = 1) => `すべての敵に出目の合計値の1.5倍(${Math.floor(sum * 1.5)})のダメージを与え、自分にランダムなバフを${buffCount}つ付与`,
    },
    en: {
      handName: 'Straight',
      text: (sum, buffCount = 1) => `Deals 1.5x damage of the total dice value (${Math.floor(sum * 1.5)}) to all enemies and grants ${buffCount} random buff(s) to self.`,
    },
  },
  'full house': {
    ja: {
      handName: 'フルハウス',
      text: (sum, attackReduction = 2) => `出目の合計値の1.5倍(${Math.floor(sum * 1.5)})のダメージを与え、与えたダメージの半分の量HPを回復し、敵のこのターンの攻撃力 - ${attackReduction}`,
    },
    en: {
      handName: 'Full House',
      text: (sum, attackReduction = 2) => `Deals 1.5x damage of the total dice value (${Math.floor(sum * 1.5)}), heals for half the damage dealt, and reduces enemy's attack by ${attackReduction} for this turn.`,
    },
  },
  'three card': {
    ja: {
      handName: 'スリーカード',
      text: (sum, shieldValue) => `出目の合計値(${sum})のダメージを与え、自分にシールドを${shieldValue}付与`,
    },
    en: {
      handName: 'Three of a Kind',
      text: (sum, shieldValue) => `Deals damage equal to the total dice value (${sum}) and grants self a shield of ${shieldValue}.`,
    },
  },
  'all even': {
    ja: {
      handName: 'オールイーブン',
      text: (sum) => `出目の合計値(${sum})のダメージを与え、与えたダメージの半分の量HPを回復する`,
    },
    en: {
      handName: 'All Even',
      text: (sum) => `Deals damage equal to the total dice value (${sum}) and heals for half the damage dealt.`,
    },
  },
  'all odd': {
    ja: {
      handName: 'オールオッド',
      text: (sum) => `出目の合計値(${sum})のダメージを与え、与えたダメージの半分の量HPを回復する`,
    },
    en: {
      handName: 'All Odd',
      text: (sum) => `Deals damage equal to the total dice value (${sum}) and heals for half the damage dealt.`,
    },
  },
  'one pair': {
    ja: {
      handName: 'ワンペア',
      text: (sum) => `出目の合計値(${sum})のダメージ`,
    },
    en: {
      handName: 'One Pair',
      text: (sum) => `Deals damage equal to the total dice value (${sum}).`,
    },
  },
  'no pair': {
    ja: {
      handName: 'ノーペア',
      text: (sum) => `出目の合計値(${sum})の半分のダメージ`,
    },
    en: {
      handName: 'No Pair',
      text: (sum) => `Deals half the damage of the total dice value (${sum}).`,
    },
  },
};

export function judgeHand() {
  const diceElements = document.querySelectorAll('.dice');

  if (diceElements.length !== 4) {
    message('warning', '重大なエラー: サイコロの数が正しくありません', 'infinity');
    return;
  }
  // 数値に変換して配列に格納
  const dices = Array.from(diceElements).map(el => parseInt(el.textContent, 10));
  // 各出目の個数をカウントするオブジェクトを作成
  const counts = dices.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  // 個数の配列
  const countsValues = Object.values(counts);
  // 出目の合計
  const sum = dices.reduce((a, b) => a + b, 0);

  // 現在の言語設定を取得
  const lang = window.currentLang === 'en' ? 'en' : 'ja';

  // フォーカード
  if (countsValues.includes(4)) {
    const handInfo = handData['four card'];
    return {
      handId: 'four card',
      handName: handInfo[lang].handName,
      text: handInfo[lang].text(sum),
      skillpoint: 5,
    };
  }
  // ストレート
  const sortedUniqueDices = [...new Set(dices)].sort((a, b) => a - b);
  if (sortedUniqueDices.length === 4 && sortedUniqueDices[3] - sortedUniqueDices[0] === 3) {
    const handInfo = handData['straight'];
    // アイテムID:10「勝利の旗印」を持っているか確認
    const count10 = globalGameState.player.items.filter(item => item === 10).length;
    const buffCount = count10 * 1 + 1;
    return {
      handId: 'straight',
      handName: handInfo[lang].handName,
      text: handInfo[lang].text(sum, buffCount),
      skillpoint: 4,
    };
  }
  // フルハウス (ツーペア)
  if (countsValues.length === 2 && countsValues.every(v => v === 2)) {
    const handInfo = handData['full house'];
    // アイテムID:9「王家の紋章」を持っているか確認
    const count9 = globalGameState.player.items.filter(item => item === 9).length;
    const attackReduction = count9 * 1 + 2;
    return {
      handId: 'full house',
      handName: handInfo[lang].handName,
      text: handInfo[lang].text(sum, attackReduction),
      skillpoint: 3,
    };
  }
  // スリーカード
  if (countsValues.includes(3)) {
    const threeOfAKindValue = parseInt(Object.keys(counts).find(key => counts[key] === 3), 10);
    const handInfo = handData['three card'];
    // アイテムID:11「鉄壁の盾」を持っているか確認
    const count11 = globalGameState.player.items.filter(item => item === 11).length;
    const hasBastionShield = count11 * 1 + 1;
    return {
      handId: 'three card',
      handName: handInfo[lang].handName,
      text: handInfo[lang].text(sum, hasBastionShield * threeOfAKindValue),
      skillpoint: 2,
    };
  }
  // オールイーブン (すべての出目が偶数)
  if (dices.every(d => d % 2 === 0)) {
    const handInfo = handData['all even'];
    return {
      handId: 'all even',
      handName: handInfo[lang].handName,
      text: handInfo[lang].text(sum),
      skillpoint: 2,
    };
  }
  // オールオッド (すべての出目が奇数)
  if (dices.every(d => d % 2 !== 0)) {
    const handInfo = handData['all odd'];
    return {
      handId: 'all odd',
      handName: handInfo[lang].handName,
      text: handInfo[lang].text(sum),
      skillpoint: 2,
    };
  }
  // ワンペア
  if (countsValues.includes(2)) {
    const handInfo = handData['one pair'];
    return {
      handId: 'one pair',
      handName: handInfo[lang].handName,
      text: handInfo[lang].text(sum),
      skillpoint: 1,
    };
  }
  // ノーペア
  const handInfo = handData['no pair'];
  return {
    handId: 'no pair',
    handName: handInfo[lang].handName,
    text: handInfo[lang].text(sum),
    skillpoint: 0,
  };
}