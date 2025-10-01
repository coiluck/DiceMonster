// buff.js
const buffsText = {
  shield: {
    ja: "シールドを消費して受けるダメージを無効化する",
    en: "Consumes the shield to nullify incoming damage."
  },
  attack: {
    ja: "与えるダメージを値の数値、増加させる",
    en: "Increases the damage dealt by the specified value."
  },
  reduction: {
    ja: "受けるダメージを値の数値、軽減する",
    en: "Reduces the damage received by the specified value."
  },
}

import { globalGameState } from "./gameState.js";

export function renderBuff() {
  document.querySelector('#player-buff-container .buff-shield .buff-number').textContent = globalGameState.player.shield;
  document.querySelector('#player-buff-container .buff-shield').style.display = globalGameState.player.shield === 0 ? 'none' : 'block';
  document.querySelector('#player-buff-container .buff-attack .buff-number').textContent = globalGameState.player.attack;
  document.querySelector('#player-buff-container .buff-attack').style.display = globalGameState.player.attack === 0 ? 'none' : 'block';
  document.querySelector('#player-buff-container .buff-reduction .buff-number').textContent = globalGameState.player.damageReduction;
  document.querySelector('#player-buff-container .buff-reduction').style.display = globalGameState.player.damageReduction === 0 ? 'none' : 'block';
}

import { addTooltipEvents } from "./addToolTip.js";

document.addEventListener('DOMContentLoaded', () => {
  addTooltipEvents(document.querySelector('#player-buff-container .buff-shield'), buffsText.shield.ja);
  addTooltipEvents(document.querySelector('#player-buff-container .buff-attack'), buffsText.attack.ja);
  addTooltipEvents(document.querySelector('#player-buff-container .buff-reduction'), buffsText.reduction.ja);
});