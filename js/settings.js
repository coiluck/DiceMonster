// settings.js
const btnJa = document.getElementById('btn-ja');
const btnEn = document.getElementById('btn-en');
window.currentLang = 'ja'; // ほんとうはlocalStrageかnodeの保存領域に入れる
// currentLangの部分は後で書く
btnJa.addEventListener('click', () => {
  btnJa.classList.add('active');
  btnEn.classList.remove('active');
  window.currentLang = 'ja';
  changeLanguage();
});
btnEn.addEventListener('click', () => {
  btnEn.classList.add('active');
  btnJa.classList.remove('active');
  window.currentLang = 'en';
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

document.getElementById('settings-close-button').addEventListener('click', (event) => {
  if (document.getElementById('modal-settings').style.zIndex === '100') {
    closeModal('settings');
    console.log('from pause')
  } else {
    changeModal('top', null, 500);
    console.log('from top')
  }
})


// LanguageData
function changeLanguage() {
  languageData.forEach(item => {
    const element = document.querySelector(item.selector);
    if (element) {
      element.textContent = item[window.currentLang];
    }
  });
};
const languageData = [
  // modal-game
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
]
