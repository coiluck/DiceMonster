// difficultly.js
import { changeModal } from './module/changeModal.js';

document.querySelector('#difficulty-close-button').addEventListener('click', () => {
  changeModal('top', null, 500);
});

import { globalGameState } from './module/gameState.js';
import { initGame } from './game.js';
  
document.querySelector('#difficulty-easy').addEventListener('click', () => {
  globalGameState.difficulty = 'easy';
  initGame();
  changeModal('game', null, 500, true);
});
document.querySelector('#difficulty-normal').addEventListener('click', () => {
  globalGameState.difficulty = 'normal';
  initGame();
  changeModal('game', null, 500, true);
});
document.querySelector('#difficulty-hard').addEventListener('click', () => {
  globalGameState.difficulty = 'hard';
  initGame();
  changeModal('game', null, 500, true);
});