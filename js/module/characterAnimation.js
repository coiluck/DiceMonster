// characterAnimation.js
export class CharacterAnimation {
  constructor(selector, imageFolder, maxFrame, options = {}) {
    this.currentFrame = 1;
    this.isPlaying = false;
    this.animationInterval = null;
    this.direction = 1;
    this.speed = options.speed || 25; // フレーム/秒
    this.isWaiting = false;

    // 切り返し時の待機時間
    this.reverseDelayMin = options.reverseDelayMin || 0;
    this.reverseDelayMax = options.reverseDelayMax || 0;
    
    this.MIN_FRAME = options.minFrame || 1;
    this.MAX_FRAME = maxFrame;
    this.imageFolder = imageFolder;
    
    this.imageElement = document.querySelector(selector);
    
    if (!this.imageElement) {
      console.error(`Image element not found: ${selector}`);
      return;
    }
    
    this.updateFrame();
  }
  
  // フレーム更新
  updateFrame() {
    this.imageElement.src = `${this.imageFolder}/${this.currentFrame}.avif`;
  }
  
  // 次のフレームに進む
  nextFrame() {
    if (this.isWaiting) return;
    
    this.currentFrame += this.direction;
    
    // 範囲チェックと方向転換
    if (this.currentFrame >= this.MAX_FRAME) {
      this.currentFrame = this.MAX_FRAME;
      this.handleReverse();
    } else if (this.currentFrame <= this.MIN_FRAME) {
      this.currentFrame = this.MIN_FRAME;
      this.handleReverse();
    }
    this.updateFrame();
  }

  // 方向転換
  handleReverse() {
    const delay = this.getRandomDelay();
    
    if (delay > 0) {
      this.isWaiting = true;
      setTimeout(() => {
        this.direction *= -1;
        this.isWaiting = false;
      }, delay);
    } else {
      this.direction *= -1;
    }
  }

  getRandomDelay() {
    if (this.reverseDelayMin === 0 && this.reverseDelayMax === 0) {
      return 0;
    }
    return Math.random() * (this.reverseDelayMax - this.reverseDelayMin) + this.reverseDelayMin;
  }
  
  // 開始
  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    const interval = 1000 / this.speed;
    this.animationInterval = setInterval(() => this.nextFrame(), interval);
  }
  
  // 停止
  stop() {
    this.isPlaying = false;
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }
  
  // リセット
  reset() {
    this.stop();
    this.currentFrame = this.MIN_FRAME;
    this.direction = 1;
    this.updateFrame();
  }
}

// 使用
export const playerAnimInGame = new CharacterAnimation(
  '.card.player .game-image-container img',
  './assets/images/player',
  11,
  {
    reverseDelayMin: 2000,
    reverseDelayMax: 10000
  }
);
export const playerAnimInTop = new CharacterAnimation(
  '.top-player-image',
  './assets/images/player',
  11,
  {
    reverseDelayMin: 2000,  // 2秒
    reverseDelayMax: 10000  // 10秒
  }
);
export const playerAnimOfAscension = new CharacterAnimation(
  '.card.player .game-image-container img',
  './assets/images/player',
  15,
);