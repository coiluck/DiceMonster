// music.js
let bgmVolume = 40;
let seVolume = 80;

let seVolumeChangeTimer = null;

export function setVolume(audioType, volume) {
  if (audioType === 'bgm') {
    bgmVolume = Number(volume);
    bgm.changeVolume(bgmVolume);
  } else if (audioType === 'se') {
    seVolume = Number(volume);
    
    // 既存のタイマーをクリア
    if (seVolumeChangeTimer) {
      clearTimeout(seVolumeChangeTimer);
    }
    // 500ms後に再生
    seVolumeChangeTimer = setTimeout(() => {
      playSound('metallic');
      seVolumeChangeTimer = null;
    }, 300);
  }
}

export function playSound(soundName) {
  let se = new Audio(`./assets/audio/${soundName}.mp3`);
  se.volume = seVolume / 100;
  se.play();
}

class BGMController {
  constructor() {
    this.audio = null;
    this.fadeInterval = null;
    this.isPlaying = false;
  }
  // 背景音楽を再生
  async play(audioSrc, loop = true) {
    // 既存の音楽が再生中 -> 無視
    if (this.audio) {
      return;
    }
    // 新しいAudio
    this.audio = new Audio(audioSrc);
    this.audio.volume = bgmVolume / 100;
    this.audio.loop = loop;
    // 再生開始
    this.audio.play();
    this.isPlaying = true;
  }

  changeVolume(volume) {
    this.audio.volume = volume / 100;
  }

  // フェードアウトで停止
  fadeOut(duration = 2000) {
    if (!this.audio || !this.isPlaying) {
      console.warn('再生中の音楽がありません');
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const startVolume = this.audio.volume;
      const fadeStep = startVolume / (duration / 50);
      this.fadeInterval = setInterval(() => {
        if (this.audio.volume > fadeStep) {
          this.audio.volume = Math.max(0, this.audio.volume - fadeStep);
        } else {
          // フェードアウト完了
          this.audio.volume = 0;
          this.audio.pause();
          this.audio.currentTime = 0;
          this.isPlaying = false;
          
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
          
          resolve();
        }
      }, 50);
    });
  }
}

const bgm = new BGMController();
export { bgm };