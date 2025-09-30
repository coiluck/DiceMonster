// music.js
let bgmVolume = 40;
let seVolume = 80;

export function setVolume(audioType, volume) {
  if (audioType === 'bgm') {
    bgmVolume = volume;
  } else if (audioType === 'sound') {
    seVolume = volume;
  }
}