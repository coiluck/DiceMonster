// settings.js
const btnJa = document.getElementById('btn-ja');
const btnEn = document.getElementById('btn-en');
btnJa.addEventListener('click', () => {
  btnJa.classList.add('active');
  btnEn.classList.remove('active');
  window.currentLang = 'ja';
  window.appData.setLang('ja');
  changeLanguage();
});
btnEn.addEventListener('click', () => {
  btnEn.classList.add('active');
  btnJa.classList.remove('active');
  window.currentLang = 'en';
  window.appData.setLang('en');
  changeLanguage();
});

import { setVolume } from "./module/audio.js";
// BGM Volume
document.getElementById('bgm-volume').addEventListener('input', (e) => {
  document.getElementById('bgm-value').textContent = e.target.value;
  setVolume('bgm', e.target.value)
});
// SE Volume
document.getElementById('se-volume').addEventListener('input', (e) => {
  document.getElementById('se-value').textContent = e.target.value;
  setVolume('se', e.target.value)
});

// 設定を閉じる
import { changeModal, closeModal } from "./module/changeModal.js";
import { playSound } from './module/audio.js';

document.getElementById('settings-close-button').addEventListener('click', (event) => {
  if (document.getElementById('modal-settings').style.zIndex === '100') {
    closeModal('settings');
    console.log('from pause')
  } else {
    changeModal('top', null, 500);
    console.log('from top')
  }
  playSound('button');
})


// LanguageData
export function changeLanguage() {
  languageTextData.forEach(item => {
    const element = document.querySelector(item.selector);
    if (element) {
      element.textContent = item[window.currentLang];
    }
  });
  languageImageData.forEach(item => {
    const element = document.querySelector(item.selector);
    if (element) {
      element.src = item[window.currentLang];
    }
  });
  playSound('metallic');
};
const languageTextData = [
  // top
  {
    selector: '.top-main-title',
    ja: '六面天運',
    en: 'Dice Monster',
  },
  {
    selector: '.top-sub-title .top-sub-title-text',
    ja: '振って、揃えて、運命を覆せ',
    en: 'Roll the dice. Shape your fate.',
  },
  {
    selector: '.top-continue-button .top-button-text',
    ja: '前回の冒険から',
    en: 'Continue from Last Adventure',
  },
  {
    selector: '.top-continue-button .top-button-subtext',
    ja: '物語を紡ぎ直す',
    en: 'Rewrite the Story',
  },
  {
    selector: '.top-new-button .top-button-text',
    ja: '新たな旅を始める',
    en: 'Start New Journey',
  },
  {
    selector: '.top-new-button .top-button-subtext',
    ja: '未知の運命へ',
    en: 'To Unknown Fate',
  },
  {
    selector: '.top-rules-button .top-button-text',
    ja: '冒険の掟を知る',
    en: 'Know the Rules',
  },
  {
    selector: '.top-rules-button .top-button-subtext',
    ja: '運命に抗う術を',
    en: 'Resist Fate',
  },
  // difficulty
  {
    selector: '.difficulty-container h2',
    ja: '難易度を選択してください',
    en: 'Select Difficulty',
  },
  // rules
  {
    selector: '#modal-rules .rules-container h2',
    ja: 'ゲームについて',
    en: 'About the Game'
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-1 h3',
    ja: 'ゲームの目的と流れ',
    en: 'Game Purpose and Flow',
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-1 p',
    ja: 'サイコロを振って役を作り、出現する敵をすべて倒してラウンドクリアを目指すゲームです。\n\n「ダイスを振る」→「役で攻撃」→「敵の攻撃」の順でターンが進行します。',
    en: "Roll the dice to form a hand and try to clear the round by defeating all enemies that appear.\n\nA turn proceeds in this order: \"Roll Dice\" → \"Attack with Your Hand\" → \"Enemy Attack\".",
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-2 h3',
    ja: '戦闘画面の見方',
    en: 'Battle Screen Overview',
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-2 p',
    ja: '① プレイヤー情報: あなたのHP、スキルポイント、そして攻撃力アップなどの強化（バフ）状態が表示されます。\n② 敵情報: 敵の残りHPと攻撃力が表示されています。\n③ ダイスエリア: ここに振られたサイコロが表示されます。成立している「役（ハンド）」と、その効果も確認できます。\n④ スキル: スキルポイントを消費して、戦闘を有利にするスキルを使用できます。初期状態では持っていません\n⑤ 行動ボタン: ダイスを振る、振り直す（リロール）、攻撃するなど、あなたの行動を選択します。',
    en: "① Player Info: Displays your HP, skill points, and active buffs such as attack boosts.\n② Enemy Info: Shows the enemy's remaining HP and attack power.\n③ Dice Area: The dice you've rolled appear here; you can also check the formed \"hand\" and its effects.\n④ Skills: Spend skill points to use skills that give you an advantage in battle. You don't have any at the start.\n⑤ Action Buttons: Choose actions like rolling dice, rerolling, or attacking.",
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-3 h3',
    ja: 'ダイスと役',
    en: 'Dice and Hands',
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-3 p',
    ja: '4つのサイコロを振り、ポーカーのような「役」を作って攻撃します。役が強いほど、ダメージが大きくなったり、強力な追加効果が発動したりします。\n\nサイコロを振った後は1ターンに2回まで、好きな個数を選んで振り直す「リロール」が可能です。そのまま振らずに残したいサイコロをクリックすると、サイコロの枠が赤色になり「ホールド状態」になります。',
    en: "You roll four dice and attack by making poker-like \"hands\". Stronger hands deal more damage and may trigger powerful additional effects.\n\nAfter rolling, you can reroll any number of dice up to twice per turn. Click a die you want to keep to mark it as held (its frame will turn red).",
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-4 h3',
    ja: '戦況を覆すスキル',
    en: 'Skills That Turn the Tide',
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-4 p',
    ja: '役を揃えると「スキルポイント」が溜まります。獲得するスキルポイントの量は役の強さに応じて異なります。\n\nスキルポイントを消費して、戦闘を有利に進める「スキル」を発動できます。「ダイスの出目を操作する」「敵全体にダメージを与える」など、効果は様々です。絶好のタイミングで使って戦いを有利に運びましょう。',
    en: "Forming hands fills your \"skill points\". The number of points gained depends on the strength of the hand.\n\nSpend skill points to activate skills that help you gain the upper hand in battle. Effects vary—e.g., manipulate dice results or deal damage to all enemies. Use them at the right moment to turn the fight in your favor.",
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-5 h3',
    ja: '敵の固有能力',
    en: 'Enemy Unique Abilities',
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-5 p',
    ja: '冒険の道中では、特殊な能力を持つ敵が多数出現します。特殊な能力を持つ敵は青色の枠をしており、マウスをホバーすると能力が確認できます。\n\n例えば以下のような敵がいます\n・腐敗したシカ: 出目の合計が「偶数」の時しかダメージを与えられない\n・星を紡ぐ者: 出目の合計が「素数」の時にダメージが2倍になる\n\nまた、ボスも強力な能力を有しています。青い枠の敵やボスが出てきたら、能力を確認してみてください。',
    en: "Along your adventure you'll encounter many enemies with special abilities. Enemies with special abilities have a blue border; hover the mouse to view their ability.\n\nFor example:\n・Corrupted Stag: Can only be damaged when the sum of the dice is even.\n・Starspinner: Damage is doubled when the sum of the dice is a prime number.\n\nBosses also have powerful abilities. If a blue-framed enemy or a boss appears, be sure to check its ability.",
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-6 h3',
    ja: 'ゲームの中断',
    en: 'Pausing the Game',
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-6 p',
    ja: '「Esc」キーを押すと、様々なボタンが現れます。\n「Save & Quit」を押すと現在の状態が保存され、Topの「前回の冒険から」を押すことで中断したところから再開できます。',
    en: "Press the \"Esc\" key to bring up various buttons.\nPressing \"Save & Quit\" will save your current state; you can resume where you left off by selecting \"Continue from Last Adventure\" on the top screen.",
  },
  // game
  {
    selector: '#item-button',
    ja: 'アイテム',
    en: 'Item List',
  },
  {
    selector: '#pair-button',
    ja: '役の一覧',
    en: 'Hand List',
  },
  {
    selector: '#dice-hand-info-title',
    ja: '現在の役',
    en: 'Current Hand',
  },
  {
    selector: '#dice-hand-info-effect-title',
    ja: '効果',
    en: 'Effect',
  },
  {
    selector: '#dice-roll-button',
    ja: 'ダイスを振る',
    en: 'Roll',
  },
  {
    selector: '#dice-reroll-button',
    ja: 'リロール（残り2回）',
    en: 'Reroll (2 left)',
  },
  {
    selector: '#dice-confirm-button',
    ja: '役を確定',
    en: 'Confirm Hand',
  },
  {
    selector: '#dice-attack-button',
    ja: '攻撃',
    en: 'Attack',
  },
  {
    selector: '.card.player h3',
    ja: 'プレイヤー',
    en: 'Player',
  },
  {
    selector: '#skill-point-label',
    ja: 'スキルポイント: ',
    en: 'Skill Point: ',
  },
  // result
  {
    selector: '.result-player-card-title',
    ja: '入れ替えるスキルを選択してください',
    en: 'Select the skill to replace',
  },
]
const languageImageData = [
  // rules
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-1 img',
    ja: './assets/images/rules/ja_main.avif',
    en: './assets/images/rules/en_main.avif',
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-3 img',
    ja: './assets/images/rules/ja_dice_and_hand.avif',
    en: './assets/images/rules/en_dice_and_hand.avif',
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-4 img',
    ja: './assets/images/rules/ja_skills.avif',
    en: './assets/images/rules/en_skills.avif',
  },
  {
    selector: '#modal-rules .rules-container .rules-section #rules-item-5 img',
    ja: './assets/images/rules/ja_enemy.avif',
    en: './assets/images/rules/en_enemy.avif',
  },
]