// judgeHand.js
import { message } from './message.js';

export function judgeHand() {
  const diceElements = document.querySelectorAll('.dice');

  if (diceElements.length !== 4) {
    message('warning', '重大なエラー: サイコロの数が正しくありません', 'infinity');
    return;
  }
  // 数値に変換して配列に格納
  const dices = Array.from(diceElements).map(el => parseInt(el.textContent, 10));
  // 各出目の個数をカウントするオブジェクトを作成
  // { '1': 2, '4': 1, '5': 1 } のような形式
  const counts = dices.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  // 個数の配列 [2, 1, 1]
  const countsValues = Object.values(counts);
  // 出目の合計
  const sum = dices.reduce((a, b) => a + b, 0);
  // フォーカード
  if (countsValues.includes(4)) {
    const diceValue = dices[0];
    return {
      handId: 'four card',
      handName: 'フォーカード',
      text: `出目(${diceValue}) × 3 の大ダメージを与え、すべての敵の攻撃力 - 1`,
      skillpoint: 5,
    };
  }
  // ストレート
  const sortedUniqueDices = [...new Set(dices)].sort((a, b) => a - b);
  if (sortedUniqueDices.length === 4 && sortedUniqueDices[3] - sortedUniqueDices[0] === 3) {
    return {
      handId: 'straight',
      handName: 'ストレート',
      text: `すべての敵に出目の合計値の1.5倍(${Math.floor(sum * 1.5)})のダメージを与え、自分にランダムなバフを付与`,
      skillpoint: 4,
    };
  }
  // フルハウス (ツーペア)
  if (countsValues.length === 2 && countsValues.every(v => v === 2)) {
    return {
      handId: 'full house',
      handName: 'フルハウス',
      text: `出目の合計値の1.5倍(${Math.floor(sum * 1.5)})のダメージを与え、与えたダメージの半分の量HPを回復し、敵のこのターンの攻撃力 - 2`,
      skillpoint: 3,
    };
  }
  // スリーカード
  if (countsValues.includes(3)) {
    const threeOfAKindValue = Object.keys(counts).find(key => counts[key] === 3);
    return {
      handId: 'three card',
      handName: 'スリーカード',
      text: `出目の合計値(${sum})のダメージを与え、自分にシールドを3つそろっている出目の数(${threeOfAKindValue})付与`,
      skillpoint: 2,
    };
  }
  // オールイーブン (すべての出目が偶数)
  if (dices.every(d => d % 2 === 0)) {
    return {
      handId: 'all even',
      handName: 'オールイーブン',
      text: `出目の合計値(${sum})のダメージを与え、与えたダメージの半分の量HPを回復する`,
      skillpoint: 2,
    };
  }
  // オールオッド (すべての出目が奇数)
  if (dices.every(d => d % 2 !== 0)) {
    return {
      handId: 'all odd',
      handName: 'オールオッド',
      text: `出目の合計値(${sum})のダメージを与え、与えたダメージの半分の量HPを回復する`,
      skillpoint: 2,
    };
  }
  // ワンペア
  if (countsValues.includes(2)) {
    return {
      handId: 'one pair',
      handName: 'ワンペア',
      text: `出目の合計値(${sum})のダメージ`,
      skillpoint: 1,
    };
  }
  // ノーペア
  return {
    handId: 'no pair',
    handName: 'ノーペア',
    text: `出目の合計値(${sum})の半分のダメージ`,
    skillpoint: 0,
  };
}