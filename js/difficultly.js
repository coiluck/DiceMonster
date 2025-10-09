// difficultly.js
import { changeModal } from './module/changeModal.js';
import { playSound } from './module/audio.js';

document.querySelector('#difficulty-close-button').addEventListener('click', () => {
  changeModal('top', null, 500);
  playSound('button');
});

import { globalGameState, resetGlobalState } from './module/gameState.js';
import { initGame } from './game.js';
  
document.querySelector('#difficulty-easy').addEventListener('click', () => {
  resetGlobalState();
  globalGameState.difficulty = 'easy';
  initGame();
  changeModal('game', null, 500, true);
  playSound('metallic');
});
document.querySelector('#difficulty-normal').addEventListener('click', () => {
  resetGlobalState();
  globalGameState.difficulty = 'normal';
  initGame();
  changeModal('game', null, 500, true);
  playSound('metallic');
});
document.querySelector('#difficulty-hard').addEventListener('click', () => {
  resetGlobalState();
  globalGameState.difficulty = 'hard';
  initGame();
  changeModal('game', null, 500, true);
  playSound('metallic');
});