// result.js
import { globalGameState } from "./gameState.js";
import { message } from "./message.js";
import { changeModal } from "./changeModal.js";

export function gameOver() {
  console.log('gameOver');
}

export function roundEnd() {
  changeModal('result', null, 500, false);
  setTimeout(() => {
    document.getElementById('result-header').classList.add('active');
    document.querySelector('#result-header .result-header-round').classList.add('active');
    document.getElementById('result-content').classList.add('active');
  }, 500);
}