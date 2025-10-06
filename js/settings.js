// settings.js
const btnJa = document.getElementById('btn-ja');
const btnEn = document.getElementById('btn-en');
window.currentLang = 'ja'; // ほんとうはlocalStrageかnodeの保存領域に入れる
// currentLangの部分は後で書く
btnJa.addEventListener('click', () => {
  btnJa.classList.add('active');
  btnEn.classList.remove('active');
  window.currentLang = 'ja';
});
btnEn.addEventListener('click', () => {
  btnEn.classList.add('active');
  btnJa.classList.remove('active');
  window.currentLang = 'en';
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